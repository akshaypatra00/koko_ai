import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Local storage key for draft caching between steps or refreshes
export const ONBOARDING_DRAFT_KEY = 'koko_onboarding_draft';

/**
 * Get the currently authenticated Supabase user
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    const demoUser = localStorage.getItem('koko_demo_user');
    return demoUser ? JSON.parse(demoUser) : null;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    return null;
  }
}

/**
 * Fetch a user's profile from the profiles table.
 * Does not overwrite existing onboarding completion flags.
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  const isCompletedLocally =
    localStorage.getItem(`koko_onboarding_completed_${userId}`) === 'true';
  const localName = localStorage.getItem(`koko_display_name_${userId}`) || '';

  if (!isSupabaseConfigured) {
    const demoProfile = localStorage.getItem(`koko_profile_${userId}`);
    return demoProfile
      ? JSON.parse(demoProfile)
      : { id: userId, display_name: localName, onboarding_completed: isCompletedLocally };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching user profile from database:', error.message);
      return {
        id: userId,
        display_name: localName,
        onboarding_completed: isCompletedLocally,
      };
    }

    // Auto-create initial profile row safely without overwriting if it doesn't exist yet
    if (!data) {
      try {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            display_name: localName,
            onboarding_completed: isCompletedLocally,
          })
          .select()
          .maybeSingle();

        if (insertError) {
          console.warn('Could not insert initial profile:', insertError.message);
          return {
            id: userId,
            display_name: localName,
            onboarding_completed: isCompletedLocally,
          };
        }
        return newProfile;
      } catch (insertErr) {
        return {
          id: userId,
          display_name: localName,
          onboarding_completed: isCompletedLocally,
        };
      }
    }

    // If database says completed, sync to local storage
    if (data.onboarding_completed) {
      localStorage.setItem(`koko_onboarding_completed_${userId}`, 'true');
    } else if (isCompletedLocally) {
      // Self-heal: local storage or metadata verified completion, sync back to DB
      supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)
        .catch(() => {});
      return { ...data, onboarding_completed: true };
    }

    if (data.display_name) {
      localStorage.setItem(`koko_display_name_${userId}`, data.display_name);
    }

    return data;
  } catch (err) {
    console.error('getUserProfile exception:', err);
    return {
      id: userId,
      display_name: localName,
      onboarding_completed: isCompletedLocally,
    };
  }
}

/**
 * Fetch a user's preferences from user_preferences table
 */
export async function getUserPreferences(userId) {
  if (!userId) return null;

  if (!isSupabaseConfigured) {
    const demoPrefs = localStorage.getItem(`koko_prefs_${userId}`);
    return demoPrefs ? JSON.parse(demoPrefs) : null;
  }

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching user preferences:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('getUserPreferences exception:', err);
    return null;
  }
}

/**
 * Resilient multi-tier check to determine if the user has completed onboarding:
 * 1. LocalStorage flag (immediate, 0ms latency)
 * 2. Supabase Auth user_metadata (server-side, persists across devices without DB dependencies)
 * 3. Database public.profiles table (onboarding_completed flag)
 * 4. Database public.user_preferences table (fallback self-healing)
 */
export async function hasCompletedOnboarding(userId, passedUser = null) {
  if (!userId && !passedUser?.id) return false;
  const effectiveUserId = userId || passedUser?.id;

  // 1. Instant check via localStorage
  if (localStorage.getItem(`koko_onboarding_completed_${effectiveUserId}`) === 'true') {
    return true;
  }

  // 2. Check Supabase Auth user_metadata (persists in auth.users)
  let authUser = passedUser;
  if (!authUser && isSupabaseConfigured) {
    try {
      authUser = await getCurrentUser();
    } catch (e) {
      console.warn('Could not read currentUser in hasCompletedOnboarding:', e);
    }
  }

  if (authUser?.user_metadata?.onboarding_completed === true) {
    localStorage.setItem(`koko_onboarding_completed_${effectiveUserId}`, 'true');
    return true;
  }

  // 3. Check public.profiles in database
  try {
    const profile = await getUserProfile(effectiveUserId);
    if (profile?.onboarding_completed === true) {
      localStorage.setItem(`koko_onboarding_completed_${effectiveUserId}`, 'true');
      return true;
    }
  } catch (profErr) {
    console.warn('Could not check profile completion:', profErr);
  }

  // 4. Fallback self-healing: Check if user_preferences record already exists
  try {
    const prefs = await getUserPreferences(effectiveUserId);
    if (prefs && (prefs.primary_use_cases?.length > 0 || prefs.experience_level)) {
      // Preferences were already configured in a previous session; self-heal all stores
      localStorage.setItem(`koko_onboarding_completed_${effectiveUserId}`, 'true');
      if (isSupabaseConfigured) {
        supabase.auth.updateUser({ data: { onboarding_completed: true } }).catch(() => {});
        supabase.from('profiles').update({ onboarding_completed: true }).eq('id', effectiveUserId).catch(() => {});
      }
      return true;
    }
  } catch (prefErr) {
    console.warn('Could not check preferences fallback:', prefErr);
  }

  return false;
}

/**
 * Save complete onboarding data for a user across all persistence layers:
 * 1. LocalStorage
 * 2. Supabase Auth user metadata
 * 3. Profiles table
 * 4. User preferences table
 * 5. Initial memories
 */
export async function saveOnboardingData(userId, onboardingData) {
  if (!userId) throw new Error('User ID is required to save onboarding data.');

  const trimmedDisplayName = onboardingData.display_name?.trim() || 'Koko User';
  const trimmedProject = onboardingData.current_project?.trim() || null;

  // Map experience_level to valid database check constraint values:
  // ('beginner', 'intermediate', 'advanced', 'expert')
  const validExperienceLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const rawExperience = onboardingData.experience_level?.toLowerCase() || 'intermediate';
  const normalizedExperience = validExperienceLevels.includes(rawExperience)
    ? rawExperience
    : 'intermediate';

  // Map memory_preference to valid database check constraint values:
  // ('remember_useful_details', 'ask_before_saving', 'current_conversation_only')
  const validMemoryPrefs = [
    'remember_useful_details',
    'ask_before_saving',
    'current_conversation_only',
  ];
  const normalizedMemory = validMemoryPrefs.includes(onboardingData.memory_preference)
    ? onboardingData.memory_preference
    : 'remember_useful_details';

  // Tier 1: Local Storage immediate persistence
  localStorage.setItem(`koko_onboarding_completed_${userId}`, 'true');
  localStorage.setItem(`koko_display_name_${userId}`, trimmedDisplayName);

  // Demo fallback when Supabase credentials are not live
  if (!isSupabaseConfigured) {
    const profile = {
      id: userId,
      display_name: trimmedDisplayName,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };
    const preferences = {
      id: 'demo-pref-id',
      user_id: userId,
      primary_use_cases: onboardingData.primary_use_cases || [],
      experience_level: normalizedExperience,
      response_style: onboardingData.response_style || 'Concise and direct',
      preferred_language: onboardingData.preferred_language || 'auto',
      current_project: trimmedProject,
      memory_preference: normalizedMemory,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(`koko_profile_${userId}`, JSON.stringify(profile));
    localStorage.setItem(`koko_prefs_${userId}`, JSON.stringify(preferences));
    sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);

    return { success: true, profile, preferences, isDemo: true };
  }

  // Tier 2: Supabase Auth user metadata update (guarantees completion status on future logins)
  try {
    await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        display_name: trimmedDisplayName,
        experience_level: normalizedExperience,
      },
    });
  } catch (metaErr) {
    console.warn('Could not sync user_metadata in Supabase Auth:', metaErr);
  }

  // Tier 3: Upsert public.profiles (mark onboarding_completed = true)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        display_name: trimmedDisplayName,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.warn('Profile table update error:', profileError.message);
    // Even if profiles table has an issue, user_metadata and localStorage have saved completion status
  }

  // Tier 4: Upsert User Preferences
  const { error: prefError } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        primary_use_cases: onboardingData.primary_use_cases || [],
        experience_level: normalizedExperience,
        response_style: onboardingData.response_style || 'Concise and direct',
        preferred_language: onboardingData.preferred_language || 'auto',
        current_project: trimmedProject,
        memory_preference: normalizedMemory,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (prefError) {
    console.warn('Preferences table update error:', prefError.message);
  }

  // Tier 5: Conditionally insert initial memory if project was provided and memory isn't disabled
  if (trimmedProject && normalizedMemory !== 'current_conversation_only') {
    try {
      const memoryText = `The user is currently working on: ${trimmedProject}`;
      await supabase.from('memories').insert({
        user_id: userId,
        memory_text: memoryText,
        memory_type: 'project',
        importance: 2,
      });
    } catch (memErr) {
      console.warn('Optional memory initialization note:', memErr);
    }
  }

  // Clean up cached draft after successful save
  sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);

  return { success: true };
}
