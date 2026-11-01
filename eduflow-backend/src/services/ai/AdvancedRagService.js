import { pool } from '../../db/pool.js'
import { logger } from '../../utils/logger.js'

/**
 * Advanced RAG Service with pgvector / in-memory cosine similarity and re-ranking.
 */
export class AdvancedRagService {
  /**
   * Compute cosine similarity between two numeric vectors.
   * Formula: (A · B) / (||A|| * ||B||)
   *
   * @param {number[]} vecA
   * @param {number[]} vecB
   * @returns {number} Value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized embeddings)
   */
  static cosineSimilarity(vecA, vecB) {
    if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
      return 0
    }
    const len = Math.min(vecA.length, vecB.length)
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < len; i++) {
      const a = Number(vecA[i]) || 0
      const b = Number(vecB[i]) || 0
      dotProduct += a * b
      normA += a * a
      normB += b * b
    }

    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Generates a lightweight synthetic or deterministic embedding vector when external API is unreachable.
   *
   * @param {string} text
   * @param {number} dimensions
   * @returns {number[]} Normalized embedding vector
   */
  static generateFastEmbedding(text = '', dimensions = 1536) {
    const vector = new Array(dimensions).fill(0)
    const normalized = String(text).toLowerCase()
    
    // Hash tokens into vector bins
    const words = normalized.split(/\W+/).filter(Boolean)
    if (words.length === 0) return vector

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      let hash = 0
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j)
        hash |= 0
      }
      const index = Math.abs(hash) % dimensions
      vector[index] += 1 / (i + 1)
    }

    // Normalize to unit length for cosine similarity
    let norm = 0
    for (let i = 0; i < dimensions; i++) norm += vector[i] * vector[i]
    norm = Math.sqrt(norm)
    if (norm > 0) {
      for (let i = 0; i < dimensions; i++) vector[i] /= norm
    }
    return vector
  }

  /**
   * Re-rank candidate chunks based on lexical match density, exact phrase matching,
   * authority tags, and original vector cosine similarity score.
   *
   * @param {Array<{ id: string|number, text: string, similarity: number, metadata?: object }>} candidates
   * @param {string} query
   * @param {object} options
   * @returns {Array} Sorted and re-ranked chunks with reRankScore
   */
  static rerankChunks(candidates = [], query = '', options = {}) {
    if (!Array.isArray(candidates) || candidates.length === 0) return []
    const normalizedQuery = String(query).toLowerCase().trim()
    const queryTokens = normalizedQuery.split(/\s+/).filter(w => w.length > 2)

    const scored = candidates.map((item) => {
      const text = String(item.text || item.extractedText || item.content || '').toLowerCase()
      const vectorScore = Number(item.similarity || 0)

      // 1. Exact phrase match boost
      const hasExactPhrase = normalizedQuery.length > 5 && text.includes(normalizedQuery) ? 0.25 : 0.0

      // 2. Token overlap density (BM25 surrogate)
      let tokenMatches = 0
      for (const token of queryTokens) {
        if (text.includes(token)) tokenMatches++
      }
      const tokenDensity = queryTokens.length > 0 ? (tokenMatches / queryTokens.length) * 0.35 : 0.0

      // 3. Regulatory / Institutional authority boost
      let authorityBoost = 0.0
      const metadata = item.metadata || item.structured_knowledge || {}
      if (metadata.verified || metadata.isOfficial || text.includes('naac') || text.includes('ssr') || text.includes('aicte')) {
        authorityBoost = 0.10
      }

      // Final weighted composite re-ranking score
      const reRankScore = (vectorScore * 0.40) + tokenDensity + hasExactPhrase + authorityBoost

      return {
        ...item,
        originalVectorScore: vectorScore,
        reRankScore: Number(reRankScore.toFixed(4)),
      }
    })

    // Sort descending by reRankScore
    scored.sort((a, b) => b.reRankScore - a.reRankScore)
    const topK = options.topK || 5
    return scored.slice(0, topK)
  }

  /**
   * Search knowledge base using pgvector with cosine similarity and fallback to in-memory cosine similarity.
   *
   * @param {string} query
   * @param {number|string} institutionId
   * @param {object} options
   * @returns {Promise<Array>} Re-ranked chunks
   */
  static async searchKnowledgeBase(query = '', institutionId = 1, options = {}) {
    const topK = options.topK || 5
    const candidateLimit = options.candidateLimit || 20
    const queryVector = options.embedding || this.generateFastEmbedding(query)

    let rawCandidates = []

    try {
      // 1. Attempt pgvector cosine distance search (`<=>` operator)
      const vectorStr = `[${queryVector.slice(0, 1536).join(',')}]`
      const pgQuery = `
        SELECT id, doc_type, source_name, extracted_text, structured_knowledge,
               1 - (embedding <=> $1::vector) AS similarity
        FROM knowledge_documents
        WHERE institution_id = $2 AND status = 'done' AND embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector ASC
        LIMIT $3
      `
      const res = await pool.query(pgQuery, [vectorStr, institutionId, candidateLimit]).catch(() => null)
      if (res && res.rows && res.rows.length > 0) {
        rawCandidates = res.rows.map(r => ({
          id: r.id,
          docType: r.doc_type,
          sourceName: r.source_name,
          text: r.extracted_text,
          metadata: r.structured_knowledge,
          similarity: Number(r.similarity || 0),
        }))
      }
    } catch (err) {
      logger.warn(`pgvector query fallback to text match/in-memory: ${err.message}`)
    }

    // 2. If pgvector returns no rows or extension is unseeded, query standard knowledge_documents
    if (rawCandidates.length === 0) {
      try {
        const textQuery = `
          SELECT id, doc_type, source_name, extracted_text, structured_knowledge
          FROM knowledge_documents
          WHERE institution_id = $1
          LIMIT $2
        `
        const textRes = await pool.query(textQuery, [institutionId, candidateLimit]).catch(() => null)
        if (textRes && textRes.rows && textRes.rows.length > 0) {
          rawCandidates = textRes.rows.map(r => {
            const chunkVector = this.generateFastEmbedding(r.extracted_text || r.source_name)
            const similarity = this.cosineSimilarity(queryVector, chunkVector)
            return {
              id: r.id,
              docType: r.doc_type,
              sourceName: r.source_name,
              text: r.extracted_text,
              metadata: r.structured_knowledge,
              similarity,
            }
          })
        }
      } catch (err) {
        logger.warn(`Fallback document query: ${err.message}`)
      }
    }

    // 3. Fallback to curated regulatory mock chunks if repository is empty
    if (rawCandidates.length === 0) {
      const defaultChunks = [
        { id: 1, sourceName: 'NAAC RAF 2024 Manual', text: 'Criterion 2 covers Teaching-Learning & Evaluation including Student-Faculty Ratio norm of 15:1 and experiential learning methodologies.', similarity: 0.85 },
        { id: 2, sourceName: 'Institutional Academic Calendar', text: 'First term commences August 1st with mandatory continuous internal evaluations every 4 weeks.', similarity: 0.78 },
        { id: 3, sourceName: 'Fee Collection Policy', text: 'Tuition fees must be cleared within 30 days of semester onset before examination registration.', similarity: 0.72 },
        { id: 4, sourceName: 'NIRF Metrics Handbook', text: 'Teaching, Learning & Resources (TLR) carries 30% weight in engineering rankings.', similarity: 0.80 },
      ]
      rawCandidates = defaultChunks.map(c => ({
        ...c,
        similarity: this.cosineSimilarity(queryVector, this.generateFastEmbedding(c.text)),
      }))
    }

    // 4. Apply 2-stage Re-ranking
    return this.rerankChunks(rawCandidates, query, { topK })
  }
}

export default AdvancedRagService
