import { GeminiProvider } from './gemini.provider.js';
import { GroqProvider } from './groq.provider.js';
import { OpenRouterProvider } from './openrouter.provider.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.register('gemini', new GeminiProvider());
    this.register('groq', new GroqProvider());
    this.register('openrouter', new OpenRouterProvider());
  }

  register(name, providerInstance) {
    this.providers.set(name.toLowerCase(), providerInstance);
  }

  get(name) {
    const provider = this.providers.get(name?.toLowerCase());
    if (!provider) {
      const defaultProvider = this.providers.get(env.DEFAULT_TEXT_PROVIDER.toLowerCase()) || this.providers.get('gemini');
      return defaultProvider;
    }
    return provider;
  }

  getCapabilities(name) {
    const provider = this.get(name);
    return provider ? provider.capabilities : { text: true, image: false, video: false };
  }

  /**
   * Executes a single provider with timing and error capture.
   */
  async executeWithTelemetry(providerName, model, prompt, options = {}, method = 'generateText') {
    const startTime = Date.now();
    const provider = this.get(providerName);
    const effectiveModel = model || (providerName === 'gemini' ? env.DEFAULT_TEXT_MODEL : provider.config?.defaultModel);

    try {
      let result;
      if (method === 'generateImage') {
        result = await provider.generateImage(prompt, { ...options, model: effectiveModel });
      } else if (method === 'generateVideo') {
        result = await provider.generateVideo(prompt, { ...options, model: effectiveModel });
      } else {
        result = await provider.generateText(prompt, { ...options, model: effectiveModel });
      }

      const latencyMs = Date.now() - startTime;
      return {
        status: 'success',
        provider: providerName,
        model: effectiveModel,
        latencyMs,
        result,
        error: null,
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      logger.warn(`[Registry] Provider ${providerName} failed after ${latencyMs}ms:`, err.message);
      return {
        status: 'failed',
        provider: providerName,
        model: effectiveModel,
        latencyMs,
        result: null,
        error: err.message || 'Provider execution failed',
      };
    }
  }

  /**
   * Runs multiple candidate models concurrently for consensus arbitration.
   */
  async executeConsensus(modelTargets, prompt, options = {}) {
    // modelTargets: [{ provider: 'gemini', model: '...' }, { provider: 'groq', model: '...' }]
    const executions = modelTargets.map((target) =>
      this.executeWithTelemetry(target.provider, target.model, prompt, options)
    );

    const outcomes = await Promise.allSettled(executions);
    return outcomes.map((o) => (o.status === 'fulfilled' ? o.value : {
      status: 'failed',
      provider: 'unknown',
      model: 'unknown',
      latencyMs: 0,
      result: null,
      error: o.reason?.message || 'Execution failed',
    }));
  }
}

export const providerRegistry = new ProviderRegistry();
