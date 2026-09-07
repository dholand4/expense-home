import { supabase } from '@/api/supabaseClient';
import { formatSupabaseRecord } from './format';

export async function listCards() {
  const { data, error } = await supabase
    .from('cards')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(formatSupabaseRecord);
}

export async function createCard(cardData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('cards')
    .insert({ ...cardData, created_by: user.id })
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function updateCard(id, cardData) {
  const { data, error } = await supabase
    .from('cards')
    .update(cardData)
    .eq('id', id)
    .select('*, users(email)')
    .single();

  if (error) throw new Error(error.message);
  return formatSupabaseRecord(data);
}

export async function deleteCard(id) {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
