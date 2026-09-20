import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

/**
 * Lazy Supabase client instance.
 * Safe to import anywhere: only attempts to connect when credentials are present.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
}

export const getSupabaseConfigStatus = (): SupabaseConfigStatus => ({
  isConfigured: isSupabaseConfigured(),
  url: supabaseUrl ? supabaseUrl.replace(/^(https:\/\/[^/]+).*/, '$1') : '',
  hasAnonKey: Boolean(supabaseAnonKey)
});
