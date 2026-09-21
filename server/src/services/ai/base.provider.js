/**
 * Base AI Provider Interface
 * All AI model providers (Gemini, Groq, OpenRouter) inherit from this class.
 */
export class BaseProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }

  /**
   * Generates text or code from a prompt
   * @param {string} prompt - Final assembled prompt
   * @param {object} options - Options such as model, temperature, maxTokens, systemInstruction
   * @returns {Promise<{ type: string, content: string, language?: string, provider: string, model: string, usage: object }>}
   */
  async generateText(prompt, options = {}) {
    throw new Error('Method generateText() must be implemented.');
  }

  /**
   * Generates an image from a prompt
   * @param {string} prompt
   * @param {object} options
   */
  async generateImage(prompt, options = {}) {
    throw new Error(`generateImage() is not supported by ${this.name} provider.`);
  }

  /**
   * Generates a video from a prompt
   * @param {string} prompt
   * @param {object} options
   */
  async generateVideo(prompt, options = {}) {
    throw new Error(`generateVideo() is not supported by ${this.name} provider.`);
  }

  /**
   * Normalizes provider-specific errors into standard Koko AI format
   */
  normalizeError(err) {
    return {
      code: 'PROVIDER_ERROR',
      provider: this.name,
      message: err?.message || 'The selected provider could not generate a response.',
    };
  }

  /**
   * Detects whether text is primarily code and extracts the dominant language
   */
  detectCode(content) {
    const codeBlockMatch = content.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      // If the content is primarily the code block
      const codeOnly = content.trim().startsWith('```') && content.trim().endsWith('```');
      if (codeOnly) {
        return {
          isCode: true,
          language: codeBlockMatch[1] || 'typescript',
          cleanContent: codeBlockMatch[2].trim(),
        };
      }
    }
    return { isCode: false };
  }
}
