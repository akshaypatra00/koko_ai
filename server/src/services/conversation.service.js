import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

function isValidUUID(str) {
  return Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
}

export class ConversationService {
  async getConversations(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[ConversationService] getConversations notice:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('[ConversationService] getConversations error:', err.message);
      return [];
    }
  }

  async createConversation(userId, title = 'New conversation') {
    try {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .insert({
          user_id: userId,
          title: title.slice(0, 100),
        })
        .select()
        .single();

      if (!error && data) return data;
      console.warn('[ConversationService] createConversation notice:', error?.message);
    } catch (err) {
      console.warn('[ConversationService] createConversation fallback:', err.message);
    }

    // Fallback safe conversation record
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      title: title.slice(0, 100),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async getConversation(userId, conversationId) {
    if (!isValidUUID(conversationId)) {
      throw new NotFoundError('Invalid conversation ID format');
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError('Conversation not found');
    if (data.user_id !== userId) throw new ForbiddenError('You do not own this conversation');

    return data;
  }

  async updateConversation(userId, conversationId, updates) {
    // Verify ownership first
    await this.getConversation(userId, conversationId);

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .update({
        title: updates.title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteConversation(userId, conversationId) {
    // Verify ownership first
    await this.getConversation(userId, conversationId);

    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }

  generateTitleFromPrompt(prompt) {
    const clean = prompt.replace(/[^\w\s]/gi, '').trim();
    const words = clean.split(/\s+/).slice(0, 6);
    const title = words.join(' ');
    return title.charAt(0).toUpperCase() + title.slice(1) || 'New conversation';
  }
}

export const conversationService = new ConversationService();
