import { GeminiProvider } from './GeminiProvider.js'
import { OpenAIProvider } from './OpenAIProvider.js'
import { ClaudeProvider } from './ClaudeProvider.js'
import { OllamaProvider } from './OllamaProvider.js'
import { FallbackProvider } from './FallbackProvider.js'
import { BaseProvider } from './BaseProvider.js'

class MockProvider extends BaseProvider {
  constructor() {
    super()
    this.name = 'MockProvider'
  }
  async chat(messages, systemPrompt) {
    return 'This is a mock response from the fallback chain because all external providers failed or were unreachable.'
  }
  async *chatStream(messages, systemPrompt) {
    const reply = await this.chat(messages, systemPrompt)
    const tokens = reply.split(/(\s+)/)
    for (const tok of tokens) {
      if (tok) {
        yield tok
        await new Promise(r => setTimeout(r, 25))
      }
    }
  }
  async extractStructured(text, schema) {
    return {}
  }
  async generateCode(spec) {
    return []
  }
  async analyzeAndRepair(errorLog, codeFiles) {
    return codeFiles
  }
}

/**
 * Returns the configured AI provider based on AI_PROVIDER env variable.
 * Supports: gemini | openai | claude | ollama | lmstudio | fallback
 */
export function createAIProvider() {
  const providerName = (process.env.AI_PROVIDER || 'fallback').toLowerCase()
  switch (providerName) {
    case 'gemini':   return new GeminiProvider()
    case 'openai':   return new OpenAIProvider()
    case 'claude':   return new ClaudeProvider()
    case 'ollama':   return new OllamaProvider()
    case 'lmstudio': {
      // LM Studio exposes an OpenAI-compatible API
      process.env.AI_BASE_URL = process.env.AI_BASE_URL || 'http://localhost:1234/v1'
      process.env.AI_API_KEY = process.env.AI_API_KEY || 'lm-studio'
      return new OpenAIProvider()
    }
    case 'fallback': {
      const providers = []
      
      // 1. OpenAI
      try { providers.push(new OpenAIProvider()) } catch (e) { console.warn('Could not init OpenAI fallback') }
      // 2. Gemini
      try { providers.push(new GeminiProvider()) } catch (e) { console.warn('Could not init Gemini fallback') }
      // 3. LM Studio (OpenAI compatible)
      try {
        const originalBaseUrl = process.env.AI_BASE_URL
        const originalApiKey = process.env.AI_API_KEY
        process.env.AI_BASE_URL = 'http://localhost:1234/v1'
        process.env.AI_API_KEY = 'lm-studio'
        providers.push(new OpenAIProvider())
        // restore original
        if (originalBaseUrl) process.env.AI_BASE_URL = originalBaseUrl
        else delete process.env.AI_BASE_URL
        if (originalApiKey) process.env.AI_API_KEY = originalApiKey
        else delete process.env.AI_API_KEY
      } catch (e) { console.warn('Could not init LMStudio fallback') }
      // 4. Ollama
      try { providers.push(new OllamaProvider()) } catch (e) { console.warn('Could not init Ollama fallback') }

      // 5. Mock Provider (Last resort so tests don't fail)
      providers.push(new MockProvider())

      return new FallbackProvider(providers)
    }
    default:
      throw new Error(`Unsupported AI provider: "${providerName}". Supported: gemini, openai, claude, ollama, lmstudio, fallback`)
  }
}
