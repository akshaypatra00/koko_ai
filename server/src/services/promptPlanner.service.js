/**
 * Prompt Planner Service
 * Assembles a structured, high-precision context prompt with full Promptimization telemetry.
 */
export class PromptPlannerService {
  plan({ message, preferences, history = [], memories = [], analysis, responseMode = 'normal' }) {
    const userIntent = analysis.intent;
    const systemParts = [
      'You are Koko AI, an advanced multi-model AI orchestrator.',
      'Provide precise, truthful, and high-quality responses that directly address the user inquiry.',
      'Never invent false facts or assume unstated user constraints.',
    ];

    // 1. Incorporate User Preferences
    if (preferences) {
      if (preferences.response_style) {
        systemParts.push(`User Response Style Preference: ${preferences.response_style}.`);
      }
      if (preferences.experience_level) {
        systemParts.push(`User Technical Background Level: ${preferences.experience_level}. Tailor the technical depth appropriately.`);
      }
      if (preferences.preferred_language && preferences.preferred_language !== 'auto') {
        systemParts.push(`Respond in language: ${preferences.preferred_language}.`);
      }
    }

    // 2. Incorporate Output Format Rules
    if (responseMode === 'concise') {
      systemParts.push('Output constraint: Be extremely concise, direct, and avoid pleasantries.');
    } else if (responseMode === 'code_only' || responseMode === 'code') {
      systemParts.push('Output constraint: Output strictly production-ready code inside syntax-highlighted code blocks with minimal text.');
    } else if (responseMode === 'document') {
      systemParts.push('Output constraint: Format the response as a formal, comprehensive document with clear Markdown headings (##, ###), bullet points, and tables where applicable.');
    } else if (responseMode === 'detailed') {
      systemParts.push('Output constraint: Provide an in-depth, comprehensive explanation covering architectural edge-cases.');
    }

    // 3. Relevant Long-Term Memories (Filtered, never entire database)
    const relevantMemories = this._filterRelevantMemories(message, memories);
    if (relevantMemories.length > 0) {
      systemParts.push('\nRelevant Verified User Context (from long-term memory):');
      for (const mem of relevantMemories) {
        systemParts.push(`- ${mem.memory_text}`);
      }
    } else if (preferences?.current_project) {
      systemParts.push(`\nUser Active Project Context: "${preferences.current_project}"`);
    }

    // 4. Intent-specific instructions
    if (userIntent === 'coding' || userIntent === 'debugging' || responseMode === 'code') {
      systemParts.push('Format instruction: When providing code, ALWAYS wrap it in fenced code blocks with language identifiers (e.g. ```typescript, ```javascript, ```python). Provide complete, runnable, production-ready code with clear typing and brief usage examples. NEVER truncate a code block — always output the complete implementation.');
    }

    // 5. Conversation continuity instruction
    const historySlice = (history || []).filter((m) => m && m.content);
    if (historySlice.length > 0) {
      systemParts.push('IMPORTANT: You have access to the full conversation history below. When the user references "the code", "that function", "it", or any previous topic, ALWAYS look at the prior messages for context and respond accordingly. Never ask for clarification if the previous messages make the intent clear.');
    }

    const systemInstruction = systemParts.join('\n');

    // 6. Relevant conversation history (last 10 turns for context continuity)
    const relevantHistory = historySlice
      .slice(-10)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // 6. Assembled Promptimization Metadata
    const promptimization = {
      rawInput: message,
      intent: userIntent,
      complexity: analysis.complexity || 'standard',
      systemInstruction,
      inferredVectors: [
        `intent:${userIntent}`,
        `complexity:${analysis.complexity || 'standard'}`,
        userIntent === 'coding' ? 'syntax:typed_blocks' : null,
        preferences?.experience_level ? `depth:${preferences.experience_level}` : 'depth:intermediate',
        responseMode !== 'normal' ? `format:${responseMode}` : null,
        relevantMemories.length > 0 ? `memories:${relevantMemories.length}` : null,
      ].filter(Boolean),
      injectedMemories: relevantMemories.map((m) => m.memory_text),
      appliedConstraints: [
        preferences?.response_style ? `Style: ${preferences.response_style}` : null,
        preferences?.experience_level ? `Level: ${preferences.experience_level}` : null,
        responseMode !== 'normal' ? `Format Mode: ${responseMode}` : null,
      ].filter(Boolean),
    };

    return {
      finalPrompt: message,
      systemInstruction,
      conversationHistory: relevantHistory,
      injectedMemoryCount: relevantMemories.length,
      intent: userIntent,
      promptimization,
    };
  }

  /**
   * Generates an upgraded, engineered prompt for the 1-click Promptimizer button in the UI
   */
  optimizePromptText(rawPrompt, preferences = null, targetMode = 'auto') {
    const trimmed = (rawPrompt || '').trim();
    if (!trimmed) return rawPrompt;

    const lower = trimmed.toLowerCase();
    const style = preferences?.response_style || 'concise and direct';
    const level = preferences?.experience_level || 'senior/production-grade';

    if (targetMode === 'code' || /\b(function|code|component|script|algorithm|implement|api)\b/i.test(lower)) {
      return `Implement a robust, production-ready ${trimmed}. Include clean TypeScript/JavaScript types, complete error handling, edge-case coverage, and a concise usage demonstration.`;
    }

    if (targetMode === 'document' || /\b(document|report|guide|architecture|design)\b/i.test(lower)) {
      return `Create a structured, professional document explaining ${trimmed}. Structure with clear Markdown headings, architectural trade-offs, structured comparison tables, and actionable implementation steps.`;
    }

    if (targetMode === 'image' || /\b(image|picture|photo|illustration|draw)\b/i.test(lower)) {
      const subject = trimmed.replace(/^(generate|create|draw|make|render)\s+(an?\s+)?(image|picture|photo|illustration|artwork)\s+(of\s+)?/i, '');
      return `High-resolution, ultra-detailed cinematic visual of ${subject || trimmed}, 8k photorealistic, dynamic lighting, octane render style, masterpiece.`;
    }

    if (targetMode === 'video' || /\b(video|clip|animation|movie)\b/i.test(lower)) {
      const subject = trimmed.replace(/^(generate|create|make|render)\s+(an?\s+)?(video|clip|animation|movie)\s+(of\s+)?/i, '');
      return `Cinematic high-definition 4k motion footage of ${subject || trimmed}, smooth camera pan, ultra-realistic visual depth, 60fps.`;
    }

    return `${trimmed} — Provide a high-precision, structured explanation tailored for a ${level} workflow (${style}), covering key mechanisms and production best practices.`;
  }

  /**
   * Filters memories by topic overlap with the current prompt.
   */
  _filterRelevantMemories(prompt, memories = [], maxMemories = 3) {
    if (!memories || memories.length === 0) return [];

    const promptWords = new Set(
      prompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3)
    );

    const scored = memories.map((mem) => {
      const memWords = mem.memory_text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      let score = 0;
      for (const w of memWords) {
        if (promptWords.has(w)) score += 1;
      }
      score += (mem.importance || 1) * 0.5;
      return { mem, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxMemories)
      .map((s) => s.mem);
  }
}

export const promptPlanner = new PromptPlannerService();
