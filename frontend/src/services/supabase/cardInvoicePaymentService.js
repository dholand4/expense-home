import { supabase } from '@/api/supabaseClient';
import { formatSupabaseRecord } from './format';

function sanitizeInvoicePaymentData(data) {
  const payload = { ...data };
  if (payload.paid_date instanceof Date) {
    payload.paid_date = payload.paid_date.toISOString().slice(0, 10);
  } else if (typeof payload.paid_date === 'string' && payload.paid_date.includes('T')) {
    payload.paid_date = payload.paid_date.split('T')[0];
  }
  return payload;
}

export async function listCardInvoicePayments() {
  const { data, error } = await supabase
    .from('card_invoice_payments')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(formatSupabaseRecord);
}

export async function getCardInvoicePayment(cardId, monthKey) {
  const { data, error } = await supabase
    .from('card_invoice_payments')
    .select('*, users(email)')
    .eq('card_id', cardId)
    .eq('month_key', monthKey)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? formatSupabaseRecord(data) : null;
}

export async function createCardInvoicePayment(paymentData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const payload = sanitizeInvoicePaymentData({
    ...paymentData,
    created_by: user.id,
  });

  const { data, error } = await supabase
    .from('card_invoice_payments')
    .insert(payload)
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function updateCardInvoicePayment(id, paymentData) {
  const payload = sanitizeInvoicePaymentData(paymentData);

  const { data, error } = await supabase
    .from('card_invoice_payments')
    .update(payload)
    .eq('id', id)
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function deleteCardInvoicePayment(id) {
  const { error } = await supabase.from('card_invoice_payments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
