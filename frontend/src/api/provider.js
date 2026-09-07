export const BACKEND_PROVIDER = import.meta.env.VITE_BACKEND_PROVIDER || 'custom';
export const isSupabase = BACKEND_PROVIDER === 'supabase';
