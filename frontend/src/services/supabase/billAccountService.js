import { supabase } from '@/api/supabaseClient';
import { formatSupabaseRecord } from './format';

export async function listBillAccounts() {
  const { data, error } = await supabase
    .from('bill_accounts')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(formatSupabaseRecord);
}

export async function createBillAccount(accountData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('bill_accounts')
    .insert({ ...accountData, created_by: user.id })
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function updateBillAccount(id, accountData) {
  const { data, error } = await supabase
    .from('bill_accounts')
    .update(accountData)
    .eq('id', id)
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function deleteBillAccount(id) {
  const { error } = await supabase.from('bill_accounts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
