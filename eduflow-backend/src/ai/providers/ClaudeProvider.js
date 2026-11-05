import Anthropic from '@anthropic-ai/sdk'
import { BaseProvider } from './BaseProvider.js'

export class ClaudeProvider extends BaseProvider {
  constructor() {
    super()
    this.client = new Anthropic({ apiKey: process.env.AI_API_KEY })
    this.model = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022'
  }

  async chat(messages, systemPrompt = '', options = {}) {
    const claudeMessages = messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    const maxTokens = Number(options.maxTokens || options.max_tokens || process.env.AI_MAX_TOKENS) || 8192
    const temperature = Number(options.temperature ?? process.env.AI_TEMPERATURE ?? 0.1)
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt || undefined,
      messages: claudeMessages,
    })
    return res.content[0].text
  }

  async extractStructured(text, schema) {
    const prompt = `Extract structured information and respond with ONLY valid JSON matching:\n${JSON.stringify(schema)}\n\nText:\n${text}`
    const res = await this.client.messages.create({ model: this.model, max_tokens: 2048, messages: [{ role: 'user', content: prompt }] })
    const raw = res.content[0].text.replace(/```json|```/g, '').trim()
    return JSON.parse(raw)
  }

  async generateCode(spec) {
    const prompt = `Generate Flutter Clean Architecture code for:\n${JSON.stringify(spec)}\nReturn ONLY a JSON array of {filename, content} objects.`
    const res = await this.client.messages.create({ model: this.model, max_tokens: 8192, messages: [{ role: 'user', content: prompt }] })
    const raw = res.content[0].text.replace(/```json|```/g, '').trim()
    return JSON.parse(raw)
  }

  async analyzeAndRepair(errorLog, codeFiles) {
    const prompt = `Fix this Flutter build error:\n${errorLog}\nFiles:\n${JSON.stringify(codeFiles)}\nReturn ONLY a JSON array of {filename, content}.`
    const res = await this.client.messages.create({ model: this.model, max_tokens: 8192, messages: [{ role: 'user', content: prompt }] })
    const raw = res.content[0].text.replace(/```json|```/g, '').trim()
    return JSON.parse(raw)
  }
}
