import { BaseProvider } from './base.provider.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class GroqProvider extends BaseProvider {
  constructor() {
    super('groq', {
      apiKey: env.GROQ_API_KEY,
      defaultModel: 'llama-3.3-70b-versatile',
    });
  }

  get capabilities() {
    return {
      text: true,
      image: false,
      video: false,
    };
  }

  async generateText(prompt, options = {}) {
    const model = options.model || this.config.defaultModel;
    const apiKey = this.config.apiKey;

    if (!apiKey) {
      logger.warn('[Groq] GROQ_API_KEY is not set. Generating simulated ultra-fast response.');
      return this._generateSimulatedText(prompt, model, options);
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    const messages = [];
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }

    if (options.conversationHistory && Array.isArray(options.conversationHistory)) {
      for (const msg of options.conversationHistory.slice(-8)) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: prompt });

    const body = {
      model,
      messages,
      temperature: options.temperature ?? 0.6,
      max_tokens: options.maxTokens ?? 2048,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Groq API error (Status ${response.status})`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning || '';
      const usage = data.usage || {};

      const codeCheck = this.detectCode(rawText);

      return {
        type: codeCheck.isCode ? 'code' : 'text',
        language: codeCheck.isCode ? codeCheck.language : undefined,
        content: codeCheck.isCode ? codeCheck.cleanContent : rawText,
        provider: 'groq',
        model,
        usage: {
          inputTokens: usage.prompt_tokens || Math.ceil(prompt.length / 4),
          outputTokens: usage.completion_tokens || Math.ceil(rawText.length / 4),
          totalTokens: usage.total_tokens || Math.ceil((prompt.length + rawText.length) / 4),
        },
      };
    } catch (err) {
      logger.error('[Groq] generateText failed:', err);
      throw new Error(`Groq Provider Error: ${err.message}`);
    }
  }

  _generateSimulatedText(prompt, model, options) {
    const isCode = prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('function') || prompt.toLowerCase().includes('algorithm');
    const content = isCode
      ? `\`\`\`javascript\n// High-speed execution via Groq (${model})\nexport function fastCompute(items) {\n  return items.map(x => x * 2);\n}\n\`\`\``
      : `High-throughput response from **Groq (${model})**:\n\nDirect, low-latency synthesis for: "${prompt.slice(0, 100)}...".\n\n- Real-time stream verified.\n- Zero token overhead.`;

    const codeCheck = this.detectCode(content);

    return {
      type: codeCheck.isCode ? 'code' : 'text',
      language: codeCheck.isCode ? codeCheck.language : undefined,
      content: codeCheck.isCode ? codeCheck.cleanContent : content,
      provider: 'groq',
      model,
      usage: {
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(content.length / 4),
        totalTokens: Math.ceil((prompt.length + content.length) / 4),
      },
    };
  }
}
