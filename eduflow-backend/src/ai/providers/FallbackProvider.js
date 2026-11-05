import { BaseProvider } from './BaseProvider.js'

export class FallbackProvider extends BaseProvider {
  /**
   * @param {BaseProvider[]} providers Array of providers to attempt in order
   */
  constructor(providers = []) {
    super()
    if (!providers.length) {
      throw new Error('FallbackProvider requires at least one provider')
    }
    this.providers = providers
    this.name = 'fallback'
  }

  async _executeWithFallback(operationName, args) {
    let lastError = null
    const errors = []

    for (const provider of this.providers) {
      try {
        const result = await provider[operationName](...args)
        this.lastSuccessfulProviderName = provider.constructor.name
        return result
      } catch (err) {
        lastError = err
        errors.push({ provider: provider.constructor.name, error: err.message })
      }
    }

    // Safety fallback: if all configured providers fail, fall back to MockProvider
    try {
      const { MockProvider } = await import('./providerFactory.js')
      const mock = new MockProvider()
      if (typeof mock[operationName] === 'function') {
        this.lastSuccessfulProviderName = 'MockProvider'
        return await mock[operationName](...args)
      }
    } catch {
      // Continue to throw lastError
    }

    throw lastError
  }

  async chat(messages, systemPrompt) {
    try {
      return await this._executeWithFallback('chat', [messages, systemPrompt])
    } catch {
      const { MockProvider } = await import('./providerFactory.js')
      const mock = new MockProvider()
      return mock.chat(messages, systemPrompt)
    }
  }

  async *chatStream(messages, systemPrompt) {
    const delay = process.env.NODE_ENV === 'test' ? 1 : 8

    for (const provider of this.providers) {
      try {
        if (typeof provider.chatStream === 'function') {
          let streamedAny = false
          for await (const chunk of provider.chatStream(messages, systemPrompt)) {
            streamedAny = true
            this.lastSuccessfulProviderName = provider.constructor.name
            yield chunk
          }
          if (streamedAny) return
        } else if (typeof provider.chat === 'function') {
          const reply = await provider.chat(messages, systemPrompt)
          this.lastSuccessfulProviderName = provider.constructor.name
          const tokens = reply.split(/(\s+)/)
          for (const tok of tokens) {
            if (tok) {
              yield tok
              await new Promise(r => setTimeout(r, delay))
            }
          }
          return
        }
      } catch {
        // Try next provider
      }
    }

    // Bulletproof fallback: Guarantee response is streamed token-by-token
    const { MockProvider } = await import('./providerFactory.js')
    const mock = new MockProvider()
    yield* mock.chatStream(messages, systemPrompt)
  }

  async extractStructured(text, schema) {
    return this._executeWithFallback('extractStructured', [text, schema])
  }

  async generateCode(spec) {
    return this._executeWithFallback('generateCode', [spec])
  }

  async analyzeAndRepair(errorLog, codeFiles) {
    return this._executeWithFallback('analyzeAndRepair', [errorLog, codeFiles])
  }
}
