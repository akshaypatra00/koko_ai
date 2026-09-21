import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function cleanEnv(val, fallback = '') {
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, '');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: cleanEnv(process.env.CLIENT_URL, 'http://localhost:5173'),

  // Supabase
  SUPABASE_URL: cleanEnv(process.env.SUPABASE_URL),
  SUPABASE_ANON_KEY: cleanEnv(process.env.SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),

  // AI Provider Keys
  GEMINI_API_KEY: cleanEnv(process.env.GEMINI_API_KEY),
  GROQ_API_KEY: cleanEnv(process.env.GROQ_API_KEY),
  OPENROUTER_API_KEY: cleanEnv(process.env.OPENROUTER_API_KEY),

  // Defaults
  DEFAULT_TEXT_PROVIDER: cleanEnv(process.env.DEFAULT_TEXT_PROVIDER, 'gemini'),
  DEFAULT_TEXT_MODEL: cleanEnv(process.env.DEFAULT_TEXT_MODEL, 'gemini-2.5-flash'),

  // Capabilities
  ENABLE_GEMINI_IMAGE: process.env.ENABLE_GEMINI_IMAGE === 'true' || process.env.ENABLE_GEMINI_IMAGE !== 'false',
  ENABLE_GEMINI_VIDEO: process.env.ENABLE_GEMINI_VIDEO === 'true',
  GEMINI_IMAGE_MODEL: cleanEnv(process.env.GEMINI_IMAGE_MODEL, 'imagen-3.0-generate-002'),
  GEMINI_VIDEO_MODEL: cleanEnv(process.env.GEMINI_VIDEO_MODEL, 'veo-2.0-generate-001'),
};

export function validateEnv() {
  const missing = [];
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_ANON_KEY && !env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missing.length > 0) {
    console.warn(`[Config] Notice: Missing environment variables: ${missing.join(', ')}`);
  }
}
