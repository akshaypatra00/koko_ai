import { env } from '../config/env.js';
import { providerRegistry } from './ai/providerRegistry.js';

/**
 * Model Router Service
 * Dynamically routes user prompts to the most optimal AI provider and model.
 */
export class ModelRouterService {
  /**
   * Selects primary provider and determines if multi-model consensus is required.
   */
  selectProvider(intent, complexity, userPreferences = null, preferredProvider = 'auto') {
    const defaultGeminiModel = env.DEFAULT_TEXT_MODEL || 'gemini-2.5-flash';
    const defaultGroqModel = 'llama-3.3-70b-versatile';

    // 1. Image Generation (Takes priority over text model preferences)
    if (intent === 'image_generation') {
      return {
        provider: 'gemini',
        model: env.GEMINI_IMAGE_MODEL || 'imagen-3.0-flux',
        method: 'generateImage',
        reason: 'Routed to visual asset synthesis pipeline (Flux / Imagen)',
        candidateModels: [{ provider: 'gemini', model: env.GEMINI_IMAGE_MODEL || 'imagen-3.0-flux' }],
      };
    }

    // 2. Video Generation (Takes priority over text model preferences)
    if (intent === 'video_generation') {
      return {
        provider: 'gemini',
        model: env.GEMINI_VIDEO_MODEL || 'veo-3.1-fast-generate-preview',
        method: 'generateVideo',
        reason: 'Routed to high-definition video synthesis pipeline',
        candidateModels: [{ provider: 'gemini', model: env.GEMINI_VIDEO_MODEL || 'veo-3.1-fast-generate-preview' }],
      };
    }

    // 3. User Explicit Model Selection
    if (preferredProvider && preferredProvider !== 'auto') {
      const explicit = this._mapExplicitProvider(preferredProvider);
      if (explicit) return explicit;
    }

    // 4. High Complexity / Architecture / Deep Reasoning -> Multi-Model Frontier Consensus
    if (complexity === 'high') {
      return {
        provider: 'gemini',
        model: defaultGeminiModel,
        method: 'generateText',
        reason: 'High-complexity architectural reasoning requires frontier consensus arbitration',
        candidateModels: [
          { provider: 'gemini', model: defaultGeminiModel },
          { provider: 'openrouter', model: 'openrouter/auto' },
          { provider: 'groq', model: defaultGroqModel },
        ],
      };
    }

    // 5. Coding & Debugging -> Gemini Flash (precision code & syntax) or Groq for rapid drafting
    if (intent === 'coding' || intent === 'debugging') {
      return {
        provider: 'gemini',
        model: defaultGeminiModel,
        method: 'generateText',
        reason: 'Code synthesis routed to Gemini 2.5 Flash for high token accuracy and syntax formatting',
        candidateModels: [
          { provider: 'gemini', model: defaultGeminiModel },
          { provider: 'groq', model: defaultGroqModel },
        ],
      };
    }

    // 6. General Questions / Summarization / Writing -> Gemini 2.5 Flash (Default Frontier Engine)
    if (intent === 'general_question' || intent === 'summarization' || intent === 'writing') {
      return {
        provider: 'gemini',
        model: defaultGeminiModel,
        method: 'generateText',
        reason: 'Conversational query routed to Gemini 2.5 Flash for high context understanding',
        candidateModels: [
          { provider: 'gemini', model: defaultGeminiModel },
          { provider: 'groq', model: defaultGroqModel },
        ],
      };
    }

    // 7. Standard Fallback
    return {
      provider: env.DEFAULT_TEXT_PROVIDER || 'gemini',
      model: defaultGeminiModel,
      method: 'generateText',
      reason: 'Standard text routing via default frontier model',
      candidateModels: [
        { provider: env.DEFAULT_TEXT_PROVIDER || 'gemini', model: defaultGeminiModel },
      ],
    };
  }

  _mapExplicitProvider(preferred) {
    const p = preferred.toLowerCase();
    const defaultGeminiModel = env.DEFAULT_TEXT_MODEL || 'gemini-2.5-flash';

    if (p.includes('gemini') || p === 'gemini-2-5' || p === 'gemini-2.5') {
      return {
        provider: 'gemini',
        model: defaultGeminiModel,
        method: 'generateText',
        reason: 'User explicitly selected Gemini 2.5 Flash (1M Context)',
        candidateModels: [{ provider: 'gemini', model: defaultGeminiModel }],
      };
    }
    if (p.includes('claude') || p === 'claude-3-7') {
      return {
        provider: 'openrouter',
        model: 'anthropic/claude-3.7-sonnet',
        method: 'generateText',
        reason: 'User explicitly selected Claude 3.7 Sonnet via OpenRouter',
        candidateModels: [
          { provider: 'openrouter', model: 'anthropic/claude-3.7-sonnet' },
          { provider: 'openrouter', model: 'openrouter/auto' },
        ],
      };
    }
    if (p.includes('deepseek') || p === 'deepseek-r1') {
      return {
        provider: 'openrouter',
        model: 'deepseek/deepseek-r1',
        method: 'generateText',
        reason: 'User explicitly selected DeepSeek R1 reasoning model',
        candidateModels: [
          { provider: 'openrouter', model: 'deepseek/deepseek-r1' },
          { provider: 'openrouter', model: 'openrouter/auto' },
        ],
      };
    }
    if (p.includes('gpt') || p === 'gpt-4o') {
      return {
        provider: 'openrouter',
        model: 'openai/gpt-4o',
        method: 'generateText',
        reason: 'User explicitly selected GPT-4o Omnimodal via OpenRouter',
        candidateModels: [
          { provider: 'openrouter', model: 'openai/gpt-4o' },
          { provider: 'openrouter', model: 'openrouter/auto' },
        ],
      };
    }
    if (p === 'groq' || p.includes('groq')) {
      return {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        method: 'generateText',
        reason: 'User explicitly selected Groq Llama 3.3 ultra-fast engine',
        candidateModels: [{ provider: 'groq', model: 'llama-3.3-70b-versatile' }],
      };
    }
    return null;
  }
}

export const modelRouter = new ModelRouterService();
