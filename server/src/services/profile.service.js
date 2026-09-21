import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError } from '../utils/errors.js';

export class ProfileService {
  async getProfile(userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      // Auto-create initial profile row if missing
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ id: userId, onboarding_completed: false })
        .select()
        .single();
      if (insertError) throw insertError;
      return newProfile;
    }
    return data;
  }

  async updateProfile(userId, updates) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        display_name: updates.display_name,
        avatar_url: updates.avatar_url,
        onboarding_completed: updates.onboarding_completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPreferences(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updatePreferences(userId, prefs) {
    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          primary_use_cases: prefs.primary_use_cases || [],
          experience_level: prefs.experience_level,
          response_style: prefs.response_style,
          preferred_language: prefs.preferred_language,
          current_project: prefs.current_project,
          memory_preference: prefs.memory_preference,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const profileService = new ProfileService();
