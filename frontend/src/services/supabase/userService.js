import { supabase } from '@/api/supabaseClient';
import { formatSupabaseRecord } from './format';

export async function listUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(formatSupabaseRecord);
}

export async function updateUser(id, data) {
  const { data: result, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(result);
}

export async function deleteUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function inviteUser(email, role = 'user') {
  // Gera convite ou registra pré-cadastro
  const normalizedEmail = email.toLowerCase().trim();
  const origin = window.location.origin;

  // Supabase Auth pode enviar magic link ou link de signup
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: `${origin}/accept-invite`,
      data: { role },
    },
  });

  if (error) {
    console.warn('Aviso ao enviar OTP via Supabase:', error.message);
  }

  return {
    invite_url: `${origin}/login?invited=true&email=${encodeURIComponent(normalizedEmail)}`,
    email: normalizedEmail,
  };
}
