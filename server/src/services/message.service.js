import { supabaseAdmin } from '../config/supabase.js';
import { conversationService } from './conversation.service.js';

export class MessageService {
  async getMessages(userId, conversationId) {
    // Check conversation ownership
    await conversationService.getConversation(userId, conversationId);

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async saveMessage({
    conversationId,
    userId,
    role,
    content,
    responseType = 'text',
    modelUsed = null,
    tokenCount = null,
    metadata = {},
  }) {
    try {
      // First try full insert with response_type and metadata
      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role,
          content,
          response_type: responseType,
          model_used: modelUsed,
          token_count: tokenCount,
          metadata,
        })
        .select()
        .single();

      if (!error && data) return data;

      // If column does not exist (migration pending in user's Supabase dashboard), fallback to basic columns
      if (error && (error.message?.includes('response_type') || error.message?.includes('metadata') || error.message?.includes('column'))) {
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('messages')
          .insert({
            conversation_id: conversationId,
            user_id: userId,
            role,
            content,
            model_used: modelUsed,
            token_count: tokenCount,
          })
          .select()
          .single();

        if (!fallbackError && fallbackData) {
          return { ...fallbackData, response_type: responseType, metadata };
        }
      }

      console.warn('[MessageService] Supabase message insert note:', error?.message);
      return {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
        response_type: responseType,
        model_used: modelUsed,
        token_count: tokenCount,
        metadata,
      };
    } catch (err) {
      console.warn('[MessageService] Could not save message to database:', err.message);
      return {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
        response_type: responseType,
        model_used: modelUsed,
        token_count: tokenCount,
        metadata,
      };
    }
  }

  async getLastUserMessage(userId, conversationId) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

export const messageService = new MessageService();
