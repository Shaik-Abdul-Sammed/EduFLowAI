import { BaseProvider } from './BaseProvider.js'

export class OllamaProvider extends BaseProvider {
  constructor() {
    super()
    this.baseUrl = (process.env.AI_BASE_URL || 'http://localhost:11434').replace(/\/$/, '')
    this.model = process.env.AI_MODEL || 'llama3'
  }

  async _chat(messages, systemPrompt) {
    const allMessages = systemPrompt ? [{ role: 'system', content: systemPrompt }, ...messages] : messages
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages: allMessages, stream: false }),
    })
    if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`)
    const data = await res.json()
    return data.message.content
  }

  async chat(messages, systemPrompt = '') { return this._chat(messages, systemPrompt) }

  async extractStructured(text, schema) {
    const prompt = `Extract structured info and return ONLY valid JSON matching:\n${JSON.stringify(schema)}\n\nText:\n${text}`
    const content = await this._chat([{ role: 'user', content: prompt }], '')
    return this.safeJsonParse(content || '{}', {})
  }

  async generateCode(spec) {
    const prompt = `Generate Flutter Clean Architecture code for:\n${JSON.stringify(spec)}\nReturn ONLY a JSON array of {filename, content}.`
    const content = await this._chat([{ role: 'user', content: prompt }], '')
    return this.safeJsonParse(content || '[]', [])
  }

  async analyzeAndRepair(errorLog, codeFiles) {
    const prompt = `Fix this Flutter build error:\n${errorLog}\nFiles:\n${JSON.stringify(codeFiles)}\nReturn ONLY a JSON array of {filename, content}.`
    const content = await this._chat([{ role: 'user', content: prompt }], '')
    return this.safeJsonParse(content || '[]', [])
  }
}
