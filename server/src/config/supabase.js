import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.SUPABASE_URL) {
  console.warn('[Supabase] Warning: SUPABASE_URL is not configured.');
}

const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || 'placeholder-key';

// Admin / Server-side Supabase client
export const supabaseAdmin = createClient(env.SUPABASE_URL || 'https://placeholder.supabase.co', supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Creates an authenticated Supabase client on behalf of a specific user token.
 * Enforces Row Level Security (RLS) dynamically using the user's JWT.
 */
export function createUserSupabaseClient(token) {
  return createClient(env.SUPABASE_URL || 'https://placeholder.supabase.co', env.SUPABASE_ANON_KEY || supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
