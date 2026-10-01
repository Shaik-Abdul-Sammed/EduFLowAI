import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseProvider } from './BaseProvider.js'

export class GeminiProvider extends BaseProvider {
  constructor() {
    super()
    if (!process.env.AI_API_KEY) throw new Error('AI_API_KEY is required for Gemini provider')
    this.client = new GoogleGenerativeAI(process.env.AI_API_KEY)
    this.modelName = process.env.AI_MODEL || 'gemini-3.5-flash'
  }

  async chat(messages, systemPrompt = '') {
    const apiKey = process.env.AI_API_KEY
    const model = this.modelName
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const payload = {
      contents,
      ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {})
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text
      }
    } catch {
      // Fall through to SDK fallback
    }

    const genModel = this.client.getGenerativeModel({ model: this.modelName, systemInstruction: systemPrompt })
    const history = messages.slice(0, -1).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
    const chatSession = genModel.startChat({ history })
    const lastMsg = messages[messages.length - 1]
    const result = await chatSession.sendMessage(lastMsg.content)
    return result.response.text()
  }

  async *chatStream(messages, systemPrompt = '') {
    const apiKey = process.env.AI_API_KEY
    const model = this.modelName
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const payload = {
      contents,
      ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {})
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      })

      if (res.ok && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('data:')) {
              try {
                const json = JSON.parse(trimmed.slice(5).trim())
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) yield text
              } catch {}
            }
          }
        }
        return
      }
    } catch {
      // Fall through to SDK fallback
    }

    const genModel = this.client.getGenerativeModel({ model: this.modelName, systemInstruction: systemPrompt })
    const history = messages.slice(0, -1).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
    const chatSession = genModel.startChat({ history })
    const lastMsg = messages[messages.length - 1]
    const result = await chatSession.sendMessageStream(lastMsg.content)
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) yield text
    }
  }

  async extractStructured(text, schema) {
    const prompt = `Extract structured information from the following text and return ONLY valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}\n\nText:\n${text}\n\nRespond with ONLY the JSON object, no explanation.`
    const responseText = await this.chat([{ role: 'user', content: prompt }])
    const raw = responseText.replace(/```json|```/g, '').trim()
    return JSON.parse(raw)
  }

  async generateCode(spec) {
    const prompt = `You are an expert Flutter developer following Clean Architecture.\nGenerate Flutter code for the following specification:\n${JSON.stringify(spec, null, 2)}\nReturn a JSON array of {filename, content} objects. Return ONLY the JSON array.`
    const responseText = await this.chat([{ role: 'user', content: prompt }])
    const raw = responseText.replace(/```json|```/g, '').trim()
    return JSON.parse(raw)
  }

  async analyzeAndRepair(errorLog, codeFiles) {
    const prompt = `You are an expert Flutter developer. Fix the following build error.\n\nError:\n${errorLog}\n\nCode Files:\n${JSON.stringify(codeFiles, null, 2)}\n\nReturn the fixed files as a JSON array of {filename, content} objects. Return ONLY the JSON array.`
    const responseText = await this.chat([{ role: 'user', content: prompt }])
    const raw = responseText.replace(/```json|```/g, '').trim()
    return JSON.parse(raw)
  }
}
