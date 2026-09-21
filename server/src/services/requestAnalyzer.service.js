/**
 * Request Analyzer Service
 * Categorizes user requests, estimates complexity, extracts semantic vectors,
 * and determines resource requirements for promptimization.
 */
export class RequestAnalyzerService {
  analyze(message, preferences = null, responseMode = 'normal', history = []) {
    const text = (message || '').trim();
    const lower = text.toLowerCase();
    const wordCount = text.split(/\s+/).length;

    // Detect if this is a short follow-up referencing prior context
    const isFollowUp =
      wordCount <= 8 &&
      /\b(the code|give me|show me|send it|that function|it|that|same|previous|above|continue|finish|complete|rest|remaining|go on|proceed)\b/i.test(lower);

    // Detect what the prior assistant message was about (coding, image, etc.)
    const lastAssistantContent = [...(history || [])]
      .reverse()
      .find((m) => m.role === 'assistant')?.content || '';
    const lastUserContent = [...(history || [])]
      .reverse()
      .find((m) => m.role === 'user')?.content || '';
    const priorContext = (lastAssistantContent + ' ' + lastUserContent).toLowerCase();

    // 1. Broad Image Generation Detection
    const isExplicitImageMode = responseMode === 'image';
    const isImageGen =
      isExplicitImageMode ||
      /\b(generate|create|draw|paint|render|make|produce)\s+(an?\s+)?(image|picture|photo|illustration|artwork|poster|logo|wallpaper|graphic|visual|render)\b/i.test(lower) ||
      /\b(draw me a|paint me a|render me a|text to image|t2i)\b/i.test(lower) ||
      /^(image|picture|photo|illustration|artwork)\s+of\b/i.test(lower) ||
      /\b(high quality image of|realistic photo of|hyperrealistic photo of|render of)\b/i.test(lower);

    // 2. Broad Video Generation Detection
    const isExplicitVideoMode = responseMode === 'video';
    const isVideoGen =
      isExplicitVideoMode ||
      /\b(generate|create|render|make|produce)\s+(an?\s+)?(video|clip|animation|movie|cinematic|footage)\b/i.test(lower) ||
      /\b(text to video|t2v|make a video|generate a video|animate this|render a video)\b/i.test(lower) ||
      /^(video|clip|footage|animation)\s+of\b/i.test(lower);

    // 3. Category classification
    let intent = 'general_question';

    if (isVideoGen) {
      intent = 'video_generation';
    } else if (isImageGen) {
      intent = 'image_generation';
    } else if (
      responseMode === 'code' || responseMode === 'code_only' ||
      /\b(error|bug|fix|exception|fails|crash|debug|traceback|undefined|null pointer|syntax error)\b/i.test(lower)
    ) {
      intent = /\b(error|bug|fix|exception|crash|debug)\b/i.test(lower) ? 'debugging' : 'coding';
    } else if (
      /\b(code|function|component|script|algorithm|class|api|typescript|javascript|python|react|sql|html|css|dockerfile|regex|write a function|create a function|implement|method|endpoint|polyfill|map|array|prototype)\b/i.test(lower) ||
      /[{};<>()=>\[\]]/.test(text)
    ) {
      intent = 'coding';
    } else if (
      // Short follow-up referencing prior coding context
      isFollowUp && /\b(code|function|algorithm|implement|polyfill|script|component|api|class|method|snippet)\b/i.test(priorContext)
    ) {
      intent = 'coding';
    } else if (
      isFollowUp && /\b(image|picture|photo|illustration|draw|render|visual|generate)\b/i.test(priorContext)
    ) {
      intent = 'image_generation';
    } else if (
      /\b(research|paper|study|compare models|benchmark|state of the art|history of|cite|survey)\b/i.test(lower)
    ) {
      intent = 'research';
    } else if (
      /\b(summarize|summary|tldr|key points|bullet points|brief|abstract)\b/i.test(lower)
    ) {
      intent = 'summarization';
    } else if (
      /\b(translate|translation|in spanish|in french|in german|in japanese|in hindi)\b/i.test(lower)
    ) {
      intent = 'translation';
    } else if (
      responseMode === 'document' ||
      /\b(document|report|whitepaper|specification|guide|manual|handbook|plan|roadmap|strategy|architecture|design system|milestones)\b/i.test(lower)
    ) {
      intent = 'planning';
    } else if (
      /\b(data|dataset|csv|statistics|chart|metrics|analytics|aggregate)\b/i.test(lower)
    ) {
      intent = 'data_analysis';
    } else if (
      /\b(write an essay|draft an email|compose|story|blog post|article)\b/i.test(lower)
    ) {
      intent = 'writing';
    }

    // 4. Complexity Analysis
    let complexity = 'low';

    if (
      wordCount > 80 ||
      intent === 'planning' ||
      (intent === 'coding' && (lower.includes('architecture') || lower.includes('system design') || lower.includes('full stack') || lower.includes('websocket') || lower.includes('consensus'))) ||
      lower.includes('benchmark') ||
      lower.includes('trade-offs')
    ) {
      complexity = 'high';
    } else if (
      wordCount > 25 ||
      intent === 'debugging' ||
      intent === 'coding' ||
      intent === 'research' ||
      intent === 'data_analysis'
    ) {
      complexity = 'medium';
    }

    // 5. Memory Requirement Detection
    const memoryKeywords = [
      'my project',
      'as i mentioned',
      'earlier',
      'remember',
      'my stack',
      'my preferred',
      'in my app',
      'our discussion',
      'previous',
      'like before',
    ];
    const hasMemorySignal = memoryKeywords.some((k) => lower.includes(k));
    const userWantsMemory = preferences?.memory_preference !== 'current_conversation_only';
    const requiresMemory = (hasMemorySignal || Boolean(preferences?.current_project)) && userWantsMemory;

    // 6. Multi-Model Consensus Requirement Detection
    const requiresMultipleModels =
      complexity === 'high' ||
      lower.includes('consensus') ||
      lower.includes('benchmark') ||
      lower.includes('compare models') ||
      lower.includes('cross-model');

    // 7. Extract Semantic Vectors (for Promptimization)
    const semanticVectors = [
      `intent:${intent}`,
      `complexity:${complexity}`,
      intent === 'coding' ? 'syntax:strict_typed' : null,
      preferences?.experience_level ? `depth:${preferences.experience_level}` : null,
      preferences?.response_style ? `style:${preferences.response_style}` : null,
      requiresMemory ? 'context:memory_injected' : null,
    ].filter(Boolean);

    return {
      intent,
      complexity,
      requiresMemory,
      requiresMultipleModels,
      requiresImageGeneration: isImageGen,
      requiresVideoGeneration: isVideoGen,
      semanticVectors,
    };
  }
}

export const requestAnalyzer = new RequestAnalyzerService();
