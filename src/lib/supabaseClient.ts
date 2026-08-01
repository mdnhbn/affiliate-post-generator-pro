import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

const supabaseUrl = 
  env.VITE_SUPABASE_URL || 
  env.NEXT_PUBLIC_SUPABASE_URL || 
  env.SUPABASE_URL || 
  procEnv.VITE_SUPABASE_URL || 
  procEnv.NEXT_PUBLIC_SUPABASE_URL || 
  procEnv.SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  env.VITE_SUPABASE_ANON_KEY || 
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  env.SUPABASE_ANON_KEY || 
  procEnv.VITE_SUPABASE_ANON_KEY || 
  procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  procEnv.SUPABASE_ANON_KEY || 
  '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
};
