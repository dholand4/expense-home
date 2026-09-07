import { supabase } from '@/api/supabaseClient';
import { formatSupabaseRecord } from './format';

function sanitizePaymentData(data) {
  const payload = { ...data };
  if (payload.paid_date instanceof Date) {
    payload.paid_date = payload.paid_date.toISOString().slice(0, 10);
  } else if (typeof payload.paid_date === 'string' && payload.paid_date.includes('T')) {
    payload.paid_date = payload.paid_date.split('T')[0];
  }
  return payload;
}

export async function listPaymentsByMonth(monthKey) {
  const { data, error } = await supabase
    .from('installment_payments')
    .select('*, users(email)')
    .eq('month_key', monthKey)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(formatSupabaseRecord);
}

export async function listAllPayments() {
  const { data, error } = await supabase
    .from('installment_payments')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(formatSupabaseRecord);
}

export async function listPaymentsByExpense(expenseId) {
  const { data, error } = await supabase
    .from('installment_payments')
    .select('*, users(email)')
    .eq('expense_id', expenseId)
    .order('installment_number', { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(formatSupabaseRecord);
}

export async function createPayment(paymentData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const payload = sanitizePaymentData({
    ...paymentData,
    created_by: user.id,
  });

  const { data, error } = await supabase
    .from('installment_payments')
    .insert(payload)
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function deletePayment(id) {
  const { error } = await supabase.from('installment_payments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
