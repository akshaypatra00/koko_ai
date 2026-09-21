import { supabase, isSupabaseConfigured } from './supabase';

export { supabase, isSupabaseConfigured };

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured) {
    return {
      data: { user: { email, id: 'demo-user-123' } },
      error: null,
      isDemo: true,
    };
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email, password) {
  if (!isSupabaseConfigured) {
    return {
      data: { user: { email, id: 'demo-user-123' } },
      error: null,
      isDemo: true,
    };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + '/onboarding',
    },
  });
}

/**
 * Sign in with OAuth providers (Google, GitHub, etc.)
 */
export async function signInWithOAuth(provider) {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error(`To enable ${provider} login, please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and configure the ${provider} provider in your Supabase dashboard.`),
      isDemo: true,
    };
  }
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin + '/onboarding',
    },
  });
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (!isSupabaseConfigured) {
    return { error: null };
  }
  return await supabase.auth.signOut();
}
