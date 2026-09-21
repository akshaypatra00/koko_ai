import { supabaseAdmin } from '../config/supabase.js';

export class FeedbackService {
  async submitFeedback(userId, { messageId, rating, reason = '' }) {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        user_id: userId,
        message_id: messageId,
        rating,
        reason,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const feedbackService = new FeedbackService();
