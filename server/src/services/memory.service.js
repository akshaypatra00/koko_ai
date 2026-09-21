import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class MemoryService {
  async getMemories(userId) {
    const { data, error } = await supabaseAdmin
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createMemory(userId, { memory_text, memory_type = 'preference', importance = 1 }) {
    const { data, error } = await supabaseAdmin
      .from('memories')
      .insert({
        user_id: userId,
        memory_text,
        memory_type,
        importance,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMemory(userId, memoryId, updates) {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('memories')
      .select('*')
      .eq('id', memoryId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError('Memory not found');
    if (existing.user_id !== userId) throw new ForbiddenError('You do not own this memory');

    const { data, error } = await supabaseAdmin
      .from('memories')
      .update({
        memory_text: updates.memory_text ?? existing.memory_text,
        memory_type: updates.memory_type ?? existing.memory_type,
        importance: updates.importance ?? existing.importance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memoryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMemory(userId, memoryId) {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('memories')
      .select('*')
      .eq('id', memoryId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError('Memory not found');
    if (existing.user_id !== userId) throw new ForbiddenError('You do not own this memory');

    const { error } = await supabaseAdmin
      .from('memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Evaluates a user message to extract stable, durable facts.
   * Only returns a candidate fact if it meets strict criteria.
   */
  extractStableFact(message) {
    const text = message.trim();
    const lower = text.toLowerCase();

    // Look for explicit user identity/preference declarations
    const patterns = [
      /i am building ([^.!?\n]+)/i,
      /i am working on ([^.!?\n]+)/i,
      /i prefer ([^.!?\n]+)/i,
      /i always use ([^.!?\n]+)/i,
      /my stack is ([^.!?\n]+)/i,
      /my framework is ([^.!?\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]?.trim().length > 3) {
        const fact = `The user ${match[0].toLowerCase().replace(/^i am/, 'is').replace(/^i /, '')}`;
        return {
          suggested: true,
          memory_text: fact.charAt(0).toUpperCase() + fact.slice(1),
          memory_type: lower.includes('prefer') ? 'preference' : 'project',
          importance: 2,
        };
      }
    }
    return null;
  }
}

export const memoryService = new MemoryService();
