/**
 * Abstract base class for all AI providers.
 * Every provider must implement these methods.
 */
export class BaseProvider {
  /** @param {Array<{role:string,content:string}>} messages @param {string} systemPrompt @returns {Promise<string>} */
  async chat(messages, systemPrompt) { throw new Error('Not implemented') }
  /** @param {string} text @param {Object} schema @returns {Promise<Object>} */
  async extractStructured(text, schema) { throw new Error('Not implemented') }
  /** @param {Object} spec @returns {Promise<Array<{filename:string,content:string}>>} */
  async generateCode(spec) { throw new Error('Not implemented') }
  async analyzeAndRepair(errorLog, codeFiles) { throw new Error('Not implemented') }
  /** @param {Array<{role:string,content:string}>} messages @param {string} systemPrompt @returns {AsyncGenerator<string>} */
  async *chatStream(messages, systemPrompt) {
    const full = await this.chat(messages, systemPrompt)
    const words = full.split(/(\s+)/)
    for (const word of words) {
      if (word) {
        yield word
        await new Promise(r => setTimeout(r, 25))
      }
    }
  }

  /**
   * Resilient JSON parser for LLM outputs.
   * Strips markdown fences, removes trailing commas, isolates valid JSON blocks.
   * @param {string} text
   * @param {*} [fallback=null]
   * @returns {*}
   */
  static safeJsonParse(text, fallback = null) {
    if (!text || typeof text !== 'string') return fallback
    let clean = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()
    try {
      return JSON.parse(clean)
    } catch (_) {
      // Find outermost { } or [ ]
      const firstCurly = clean.indexOf('{')
      const lastCurly = clean.lastIndexOf('}')
      const firstSquare = clean.indexOf('[')
      const lastSquare = clean.lastIndexOf(']')

      let candidate = ''
      if (firstCurly !== -1 && lastCurly > firstCurly && (firstSquare === -1 || firstCurly < firstSquare)) {
        candidate = clean.slice(firstCurly, lastCurly + 1)
      } else if (firstSquare !== -1 && lastSquare > firstSquare) {
        candidate = clean.slice(firstSquare, lastSquare + 1)
      }

      if (candidate) {
        try {
          return JSON.parse(candidate)
        } catch (e2) {
          try {
            const stripped = candidate.replace(/,\s*([}\]])/g, '$1')
            return JSON.parse(stripped)
          } catch (_) {
            if (fallback !== null) return fallback
            throw new Error(`Failed to parse structured LLM JSON: ${e2.message}`)
          }
        }
      }
      if (fallback !== null) return fallback
      throw new Error('No valid JSON structure found in LLM response')
    }
  }

  safeJsonParse(text, fallback = null) {
    return BaseProvider.safeJsonParse(text, fallback)
  }
}

