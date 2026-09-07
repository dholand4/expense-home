import { supabase } from '@/api/supabaseClient';
import { formatSupabaseRecord } from './format';

export async function listSharedAccesses({ owner_email, shared_with_email } = {}) {
  let query = supabase.from('shared_accesses').select('*');

  if (owner_email) {
    query = query.eq('owner_email', owner_email);
  }
  if (shared_with_email) {
    query = query.eq('shared_with_email', shared_with_email);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(formatSupabaseRecord);
}

export async function createSharedAccess({ shared_with_email }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('shared_accesses')
    .insert({
      owner_email: user.email.toLowerCase().trim(),
      shared_with_email: shared_with_email.toLowerCase().trim(),
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function updateSharedAccess(id, data) {
  const { data: result, error } = await supabase
    .from('shared_accesses')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(result);
}

export async function deleteSharedAccess(id) {
  const { error } = await supabase.from('shared_accesses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
