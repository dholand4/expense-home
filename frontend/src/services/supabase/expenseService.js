import { supabase } from '@/api/supabaseClient';
import { formatSupabaseRecord } from './format';

function sanitizeExpenseData(data) {
  const payload = { ...data };
  if (payload.first_charge_date instanceof Date) {
    payload.first_charge_date = payload.first_charge_date.toISOString().slice(0, 10);
  } else if (typeof payload.first_charge_date === 'string' && payload.first_charge_date.includes('T')) {
    payload.first_charge_date = payload.first_charge_date.split('T')[0];
  }
  return payload;
}

export async function listExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(formatSupabaseRecord);
}

export async function createExpense(expenseData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const payload = sanitizeExpenseData({
    ...expenseData,
    created_by: user.id,
  });

  const { data, error } = await supabase
    .from('expenses')
    .insert(payload)
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function updateExpense(id, expenseData) {
  const payload = sanitizeExpenseData(expenseData);

  const { data, error } = await supabase
    .from('expenses')
    .update(payload)
    .eq('id', id)
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
