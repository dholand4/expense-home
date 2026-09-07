import { isSupabaseConfigured } from './supabase/supabaseClient';

export const BACKEND_PROVIDER = process.env.EXPO_PUBLIC_BACKEND_PROVIDER || (isSupabaseConfigured ? 'supabase' : 'custom');
export const isSupabase = BACKEND_PROVIDER === 'supabase';

