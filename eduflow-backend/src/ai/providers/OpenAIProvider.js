import OpenAI from 'openai'
import { BaseProvider } from './BaseProvider.js'

export class OpenAIProvider extends BaseProvider {
  constructor() {
    super()
    this.client = new OpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: process.env.AI_BASE_URL || undefined,
    })
    this.model = process.env.AI_MODEL || 'gpt-4o'
  }

  async chat(messages, systemPrompt = '') {
    const allMessages = systemPrompt ? [{ role: 'system', content: systemPrompt }, ...messages] : messages
    const res = await this.client.chat.completions.create({ model: this.model, messages: allMessages })
    return res.choices[0].message.content
  }

  async *chatStream(messages, systemPrompt = '') {
    const allMessages = systemPrompt ? [{ role: 'system', content: systemPrompt }, ...messages] : messages
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: allMessages,
      stream: true,
    })
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) yield content
    }
  }

  async extractStructured(text, schema) {
    const prompt = `Extract structured information and return ONLY valid JSON matching this schema:\n${JSON.stringify(schema)}\n\nText:\n${text}`
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })
    return JSON.parse(res.choices[0].message.content)
  }

  async generateCode(spec) {
    const prompt = `Generate Flutter Clean Architecture code for:\n${JSON.stringify(spec)}\nReturn ONLY a JSON array of {filename, content} objects.`
    const res = await this.client.chat.completions.create({ model: this.model, messages: [{ role: 'user', content: prompt }] })
    const raw = res.choices[0].message.content.replace(/```json|```/g, '').trim()
    return JSON.parse(raw)
  }

  async analyzeAndRepair(errorLog, codeFiles) {
    const prompt = `Fix this Flutter build error.\nError:\n${errorLog}\nFiles:\n${JSON.stringify(codeFiles)}\nReturn ONLY a JSON array of {filename, content} with fixes applied.`
    const res = await this.client.chat.completions.create({ model: this.model, messages: [{ role: 'user', content: prompt }] })
    const raw = res.choices[0].message.content.replace(/```json|```/g, '').trim()
    return JSON.parse(raw)
  }
}
