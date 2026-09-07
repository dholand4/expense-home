import { supabase } from '@/api/supabaseClient';
import { formatSupabaseRecord } from './format';

export async function listRunningDebts() {
  const { data, error } = await supabase
    .from('running_debts')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(formatSupabaseRecord);
}

export async function createRunningDebt(debtData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const initialAmount = Number(debtData.total_amount);

  const { data, error } = await supabase
    .from('running_debts')
    .insert({
      ...debtData,
      amount_paid: debtData.amount_paid ?? 0,
      created_by: user.id,
    })
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);

  // Transação inicial de registro
  await supabase.from('running_debt_transactions').insert({
    debt_id: data.id,
    type: 'charge',
    amount: initialAmount,
    date: new Date().toISOString().slice(0, 10),
    notes: debtData.notes || 'Saldo inicial',
    created_by: user.id,
  });

  return formatSupabaseRecord(data);
}

export async function updateRunningDebt(id, debtData) {
  const { data, error } = await supabase
    .from('running_debts')
    .update(debtData)
    .eq('id', id)
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function deleteRunningDebt(id) {
  const { error } = await supabase.from('running_debts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listDebtTransactions(debtId) {
  const { data, error } = await supabase
    .from('running_debt_transactions')
    .select('*')
    .eq('debt_id', debtId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(formatSupabaseRecord);
}

export async function addDebtTransaction({ debt_id, type, amount, date, notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const numAmount = Number(amount);
  const txDate = date ? (typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('running_debt_transactions')
    .insert({
      debt_id,
      type,
      amount: numAmount,
      date: txDate,
      notes: notes || null,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  // Atualizar saldo da dívida
  const { data: currentDebt } = await supabase
    .from('running_debts')
    .select('total_amount, amount_paid')
    .eq('id', debt_id)
    .single();

  if (currentDebt) {
    if (type === 'charge') {
      await supabase
        .from('running_debts')
        .update({ total_amount: Number(currentDebt.total_amount) + numAmount })
        .eq('id', debt_id);
    } else if (type === 'payment') {
      await supabase
        .from('running_debts')
        .update({ amount_paid: Number(currentDebt.amount_paid) + numAmount })
        .eq('id', debt_id);
    }
  }

  return formatSupabaseRecord(data);
}

export async function deleteDebtTransaction(id) {
  const { error } = await supabase.from('running_debt_transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
