import { conversationService } from '../services/conversation.service.js';
import { messageService } from '../services/message.service.js';
import { profileService } from '../services/profile.service.js';
import { memoryService } from '../services/memory.service.js';
import { requestAnalyzer } from '../services/requestAnalyzer.service.js';
import { promptPlanner } from '../services/promptPlanner.service.js';
import { modelRouter } from '../services/modelRouter.service.js';
import { responseJudge } from '../services/responseJudge.service.js';
import { providerRegistry } from '../services/ai/providerRegistry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Chat Controller
 * Manages the complete multi-model AI orchestration pipeline.
 */
export const handleChat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    conversationId: passedConvId,
    message: userPrompt,
    attachments = [],
    preferredProvider = 'auto',
    responseMode = 'normal',
  } = req.body;

  const isValidUUID = (str) =>
    Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

  // 1. Resolve or Create Conversation
  let conversationId = passedConvId;
  let conversation;

  if (!conversationId || !isValidUUID(conversationId)) {
    const title = conversationService.generateTitleFromPrompt(userPrompt);
    conversation = await conversationService.createConversation(userId, title);
    conversationId = conversation.id;
  } else {
    try {
      conversation = await conversationService.getConversation(userId, conversationId);
    } catch (err) {
      const title = conversationService.generateTitleFromPrompt(userPrompt);
      conversation = await conversationService.createConversation(userId, title);
      conversationId = conversation.id;
    }
  }

  // 2. Fetch User Profile and Preferences
  const preferences = await profileService.getPreferences(userId).catch(() => null);

  // 3. Fetch History and Long-term Memories
  const [history, memories] = await Promise.all([
    isValidUUID(conversationId)
      ? messageService.getMessages(userId, conversationId).catch(() => [])
      : Promise.resolve([]),
    memoryService.getMemories(userId).catch(() => []),
  ]);

  // 4. Save User Message
  await messageService.saveMessage({
    conversationId,
    userId,
    role: 'user',
    content: userPrompt,
    responseType: 'text',
    metadata: { attachments },
  }).catch((err) => console.warn('Could not save user message:', err.message));

  // 5. Analyze Request (with history for follow-up context detection)
  const analysis = requestAnalyzer.analyze(userPrompt, preferences, responseMode, history);

  // 6. Plan Prompt
  const plan = promptPlanner.plan({
    message: userPrompt,
    preferences,
    history,
    memories,
    analysis,
    responseMode,
  });

  // 7. Route to optimal Provider / Model
  const routing = modelRouter.selectProvider(
    analysis.intent,
    analysis.complexity,
    preferences,
    preferredProvider
  );

  let finalResponse;
  let evaluatedModels = [];
  let judgeDecision = null;

  // 8. Execute AI Generation (Single or Parallel Consensus)
  const isMultiCandidate =
    routing.candidateModels &&
    routing.candidateModels.length > 1 &&
    (analysis.requiresMultipleModels || preferredProvider === 'auto');

  if (isMultiCandidate && routing.method === 'generateText') {
    // Parallel Consensus Dispatch across frontier models
    const outcomes = await providerRegistry.executeConsensus(
      routing.candidateModels,
      plan.finalPrompt,
      {
        systemInstruction: plan.systemInstruction,
        conversationHistory: plan.conversationHistory,
      }
    );

    // Response Judge Arbitration
    const verdict = responseJudge.judge(userPrompt, outcomes);
    judgeDecision = { winner: verdict.winner, score: verdict.score, reason: verdict.reason };
    evaluatedModels = verdict.evaluatedModels;

    const winnerOutcome = outcomes.find(
      (o) => o.status === 'success' && o.provider === verdict.winner
    ) || outcomes.find((o) => o.status === 'success');

    if (winnerOutcome && winnerOutcome.result) {
      finalResponse = winnerOutcome.result;
    } else {
      // Fallback if all consensus models failed
      finalResponse = {
        type: 'text',
        content: 'Frontier models encountered a temporary gateway issue. Please try again or switch model.',
        provider: routing.provider,
        model: routing.model,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
    }
  } else {
    // Single Provider Execution with Fallback
    const outcome = await providerRegistry.executeWithTelemetry(
      routing.provider,
      routing.model,
      plan.finalPrompt,
      {
        systemInstruction: plan.systemInstruction,
        conversationHistory: plan.conversationHistory,
      },
      routing.method || 'generateText'
    );

    if (outcome.status === 'success') {
      finalResponse = outcome.result;
      evaluatedModels = [
        {
          provider: outcome.provider,
          model: outcome.model,
          status: 'success',
          latencyMs: outcome.latencyMs,
          score: 0.96,
          isWinner: true,
          error: null,
          assessment: 'Perfect response - successfully generated by primary model',
        },
      ];
    } else {
      // Automatic Fallback to Default Text Provider if primary failed
      const fallbackOutcome = await providerRegistry.executeWithTelemetry(
        'gemini',
        'gemini-2.5-flash',
        plan.finalPrompt,
        {
          systemInstruction: plan.systemInstruction,
          conversationHistory: plan.conversationHistory,
        }
      );

      evaluatedModels = [
        {
          provider: outcome.provider,
          model: outcome.model,
          status: 'failed',
          latencyMs: outcome.latencyMs,
          score: 0,
          isWinner: false,
          error: outcome.error,
          assessment: `Failed (${outcome.error}) - auto-fallback triggered`,
        },
        {
          provider: fallbackOutcome.provider,
          model: fallbackOutcome.model,
          status: fallbackOutcome.status,
          latencyMs: fallbackOutcome.latencyMs,
          score: fallbackOutcome.status === 'success' ? 0.90 : 0,
          isWinner: fallbackOutcome.status === 'success',
          error: fallbackOutcome.error,
          assessment: fallbackOutcome.status === 'success'
            ? 'Fallback response - successfully recovered execution'
            : 'Fallback model also failed',
        },
      ];

      finalResponse = fallbackOutcome.result || {
        type: 'text',
        content: 'Could not generate response from selected provider.',
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
    }
  }

  // 9. Memory Fact Extraction & Preference Handling
  let memorySuggestion = null;
  const extractedFact = memoryService.extractStableFact(userPrompt);

  if (extractedFact && preferences?.memory_preference !== 'current_conversation_only') {
    if (preferences?.memory_preference === 'remember_useful_details') {
      await memoryService.createMemory(userId, extractedFact).catch(() => {});
    } else if (preferences?.memory_preference === 'ask_before_saving') {
      memorySuggestion = extractedFact;
    }
  }

  // 10. Save Assistant Response in Database
  const responseType = finalResponse.type || 'text';
  const assistantContent = finalResponse.content || finalResponse.url || '';

  const savedAssistantMessage = await messageService.saveMessage({
    conversationId,
    userId,
    role: 'assistant',
    content: assistantContent,
    responseType,
    modelUsed: `${finalResponse.provider} / ${finalResponse.model}`,
    tokenCount: finalResponse.usage?.totalTokens || null,
    metadata: {
      provider: finalResponse.provider,
      model: finalResponse.model,
      url: finalResponse.url,
      alt: finalResponse.alt,
      language: finalResponse.language,
      usage: finalResponse.usage,
      telemetry: {
        routedProvider: routing.provider,
        routedModel: routing.model,
        routingReason: routing.reason,
        evaluatedModels,
        judgeDecision,
        promptOptimization: plan.promptimization,
      },
      memorySuggestion,
    },
  });

  // 11. Return Structured Response to Frontend
  res.json({
    success: true,
    data: {
      conversationId,
      messageId: savedAssistantMessage?.id || `msg-${Date.now()}`,
      response: {
        type: responseType,
        content: finalResponse.content,
        language: finalResponse.language,
        url: finalResponse.url,
        alt: finalResponse.alt,
        thumbnailUrl: finalResponse.thumbnailUrl,
      },
      provider: finalResponse.provider,
      model: finalResponse.model,
      usage: finalResponse.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      telemetry: {
        routedProvider: routing.provider,
        routedModel: routing.model,
        routingReason: routing.reason,
        evaluatedModels,
        judgeDecision,
        promptOptimization: plan.promptimization,
      },
      memorySuggestion,
    },
  });
});

/**
 * Message Regeneration Controller
 */
export const handleRegenerate = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { conversationId, preferredProvider = 'auto' } = req.body;

  // Retrieve last user message
  const lastUserMessage = await messageService.getLastUserMessage(userId, conversationId);
  if (!lastUserMessage) {
    throw new NotFoundError('No previous user message found in this conversation to regenerate.');
  }

  // Delegate directly to handleChat logic with the previous prompt
  req.body.message = lastUserMessage.content;
  req.body.conversationId = conversationId;
  req.body.preferredProvider = preferredProvider;

  return handleChat(req, res);
});

/**
 * Promptimization Controller
 * Transforms raw user input into an engineered, high-precision prompt with full vector telemetry.
 */
export const handleOptimizePrompt = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message: rawPrompt, targetMode = 'auto' } = req.body;

  if (!rawPrompt || !rawPrompt.trim()) {
    return res.status(400).json({ success: false, error: { message: 'Prompt message is required' } });
  }

  const preferences = await profileService.getPreferences(userId).catch(() => null);
  const analysis = requestAnalyzer.analyze(rawPrompt, preferences, targetMode);
  const optimizedPrompt = promptPlanner.optimizePromptText(rawPrompt, preferences, targetMode);

  return res.json({
    success: true,
    data: {
      rawInput: rawPrompt,
      optimizedPrompt,
      intent: analysis.intent,
      complexity: analysis.complexity,
      inferredVectors: analysis.semanticVectors,
      appliedConstraints: [
        preferences?.response_style ? `Style: ${preferences.response_style}` : null,
        preferences?.experience_level ? `Level: ${preferences.experience_level}` : null,
        targetMode !== 'auto' ? `Mode: ${targetMode}` : null,
      ].filter(Boolean),
    },
  });
});
