import { supabase } from './supabaseClient';
import { formatSupabaseRecord } from './format';
import { IUser } from '../../@types/models';

function sanitizeDate(dateVal: any): string {
  if (dateVal instanceof Date) return dateVal.toISOString().slice(0, 10);
  if (typeof dateVal === 'string' && dateVal.includes('T')) return dateVal.split('T')[0];
  return dateVal;
}

export async function handleSupabaseRequest<T>(method: string, path: string, body?: any): Promise<T> {
  if (!supabase) {
    throw new Error('Supabase não configurado. Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const [pathWithoutQuery, queryString] = path.split('?');
  const searchParams = new URLSearchParams(queryString || '');
  const segments = pathWithoutQuery.split('/').filter(Boolean);

  // 1. /auth
  if (segments[0] === 'auth') {
    const action = segments[1];

    if (action === 'login') {
      const { email, password } = body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      if (error) {
        throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : error.message);
      }
      const authUser = data.user;
      const token = data.session?.access_token || '';
      const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();

      const user: IUser = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        role: profile?.role || 'user',
      };
      return { token, user } as unknown as T;
    }

    if (action === 'register') {
      const { full_name, email, password } = body;
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: { data: { full_name } },
      });
      if (error) throw new Error(error.message);

      const authUser = data.user!;
      const token = data.session?.access_token || '';
      const user: IUser = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: full_name || authUser.email?.split('@')[0] || '',
        role: 'user',
      };
      return { token, user } as unknown as T;
    }

    if (action === 'me') {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Não autenticado');
      const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();

      const user: IUser = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        role: profile?.role || 'user',
      };
      return { user } as unknown as T;
    }

    if (action === 'forgot-password') {
      const { error } = await supabase.auth.resetPasswordForEmail(body.email);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }

    if (action === 'reset-password' || action === 'accept-invite') {
      const { error } = await supabase.auth.updateUser({ password: body.password });
      if (error) throw new Error(error.message);
      return { message: 'Senha atualizada com sucesso.' } as unknown as T;
    }

    if (action === 'invite') {
      const { error } = await supabase.auth.signInWithOtp({ email: body.email });
      if (error) console.warn('Aviso invite OTP:', error.message);
      return undefined as unknown as T;
    }
  }

  // Obter usuário autenticado atual para inserções
  const getAuthUserId = async () => {
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado no Supabase.');
    return user.id;
  };

  // 2. /cards
  if (segments[0] === 'cards') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      const { data, error } = await supabase.from('cards').select('*, users(email)').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'POST') {
      const userId = await getAuthUserId();
      const { data, error } = await supabase.from('cards').insert({ ...body, created_by: userId }).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'PATCH' && id) {
      const { data, error } = await supabase.from('cards').update(body).eq('id', id).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('cards').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  // 3. /bill-accounts
  if (segments[0] === 'bill-accounts') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      const { data, error } = await supabase.from('bill_accounts').select('*, users(email)').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'POST') {
      const userId = await getAuthUserId();
      const { data, error } = await supabase.from('bill_accounts').insert({ ...body, created_by: userId }).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'PATCH' && id) {
      const { data, error } = await supabase.from('bill_accounts').update(body).eq('id', id).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('bill_accounts').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  // 4. /expenses
  if (segments[0] === 'expenses') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      const { data, error } = await supabase.from('expenses').select('*, users(email)').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'POST') {
      const userId = await getAuthUserId();
      const payload = {
        ...body,
        created_by: userId,
        first_charge_date: sanitizeDate(body.first_charge_date),
      };
      const { data, error } = await supabase.from('expenses').insert(payload).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'PATCH' && id) {
      const payload = { ...body };
      if (payload.first_charge_date) payload.first_charge_date = sanitizeDate(payload.first_charge_date);
      const { data, error } = await supabase.from('expenses').update(payload).eq('id', id).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  // 5. /installment-payments
  if (segments[0] === 'installment-payments') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      let query = supabase.from('installment_payments').select('*, users(email)');
      const monthKey = searchParams.get('month_key');
      const expenseId = searchParams.get('expense_id');
      if (monthKey) query = query.eq('month_key', monthKey);
      if (expenseId) query = query.eq('expense_id', expenseId);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'POST') {
      const userId = await getAuthUserId();
      const payload = {
        ...body,
        created_by: userId,
        paid_date: sanitizeDate(body.paid_date),
      };
      const { data, error } = await supabase.from('installment_payments').insert(payload).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('installment_payments').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  // 6. /card-invoice-payments
  if (segments[0] === 'card-invoice-payments') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      let query = supabase.from('card_invoice_payments').select('*, users(email)');
      const cardId = searchParams.get('card_id');
      const monthKey = searchParams.get('month_key');
      if (cardId) query = query.eq('card_id', cardId);
      if (monthKey) query = query.eq('month_key', monthKey);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'POST') {
      const userId = await getAuthUserId();
      const payload = {
        ...body,
        created_by: userId,
        paid_date: sanitizeDate(body.paid_date),
      };
      const { data, error } = await supabase.from('card_invoice_payments').insert(payload).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'PATCH' && id) {
      const payload = { ...body };
      if (payload.paid_date) payload.paid_date = sanitizeDate(payload.paid_date);
      const { data, error } = await supabase.from('card_invoice_payments').update(payload).eq('id', id).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('card_invoice_payments').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  // 7. /running-debts
  if (segments[0] === 'running-debts') {
    const id = segments[1];
    // Extrato e transações
    if (segments[1] === 'transactions') {
      const txId = segments[2];
      if (method === 'POST') {
        const userId = await getAuthUserId();
        const payload = {
          debt_id: body.debt_id,
          type: body.type, // 'charge' ou 'payment'
          amount: Number(body.amount),
          date: sanitizeDate(body.date || new Date()),
          notes: body.notes || null,
          created_by: userId,
        };

        let tx = null;
        const { data: insertedTx, error: txErr } = await supabase
          .from('running_debt_transactions')
          .insert(payload)
          .select('*')
          .single();

        if (txErr) {
          // Se a tabela ainda não foi criada no Supabase pelo usuário, não quebra a tela
          if (txErr.code === '42P01' || txErr.message?.includes('does not exist')) {
            console.warn('Tabela running_debt_transactions ainda não criada no Supabase.');
          } else {
            throw new Error(txErr.message);
          }
        } else {
          tx = insertedTx;
        }

        // Atualizar saldo da dívida
        const { data: currentDebt, error: getErr } = await supabase.from('running_debts').select('total_amount, amount_paid').eq('id', body.debt_id).single();
        if (getErr) throw new Error(getErr.message);

        if (currentDebt) {
          if (body.type === 'charge') {
            const { error: updErr } = await supabase.from('running_debts').update({ total_amount: Number(currentDebt.total_amount) + Number(body.amount) }).eq('id', body.debt_id);
            if (updErr) throw new Error(updErr.message);
          } else if (body.type === 'payment') {
            const { error: updErr } = await supabase.from('running_debts').update({ amount_paid: Number(currentDebt.amount_paid) + Number(body.amount) }).eq('id', body.debt_id);
            if (updErr) throw new Error(updErr.message);
          }
        }
        return formatSupabaseRecord(tx || { ...payload, id: `temp-${Date.now()}` }) as unknown as T;
      }
      if (method === 'DELETE' && txId) {
        const { error } = await supabase.from('running_debt_transactions').delete().eq('id', txId);
        if (error) throw new Error(error.message);
        return undefined as unknown as T;
      }
    }

    if (segments[2] === 'transactions' && method === 'GET') {
      const debtId = segments[1];
      const { data, error } = await supabase
        .from('running_debt_transactions')
        .select('*')
        .eq('debt_id', debtId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return [] as unknown as T;
        }
        throw new Error(error.message);
      }
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }

    if (method === 'GET' && !id) {
      const { data, error } = await supabase.from('running_debts').select('*, users(email)').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'POST') {
      const userId = await getAuthUserId();
      const initialAmount = Number(body.total_amount) || 0;
      const { data, error } = await supabase.from('running_debts').insert({ ...body, total_amount: initialAmount, amount_paid: body.amount_paid ?? 0, created_by: userId }).select('*, users(email)').single();
      if (error) throw new Error(error.message);

      // Criar transação inicial de abertura do fiado apenas se tiver saldo inicial > 0
      if (initialAmount > 0) {
        try {
          await supabase.from('running_debt_transactions').insert({
            debt_id: data.id,
            type: 'charge',
            amount: initialAmount,
            date: sanitizeDate(new Date()),
            notes: body.notes || 'Saldo inicial',
            created_by: userId,
          });
        } catch (e) {
          console.warn('Transação inicial de fiado não gravada:', e);
        }
      }

      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'PATCH' && id) {
      const { data, error } = await supabase.from('running_debts').update(body).eq('id', id).select('*, users(email)').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('running_debts').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  // 8. /shared-accesses
  if (segments[0] === 'shared-accesses') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      let query = supabase.from('shared_accesses').select('*');
      const ownerEmail = searchParams.get('owner_email');
      const sharedWithEmail = searchParams.get('shared_with_email');
      if (ownerEmail) query = query.eq('owner_email', ownerEmail);
      if (sharedWithEmail) query = query.eq('shared_with_email', sharedWithEmail);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'POST') {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('shared_accesses').insert({
        owner_email: user?.email?.toLowerCase().trim(),
        shared_with_email: body.shared_with_email?.toLowerCase().trim(),
        status: 'pending',
      }).select('*').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'PATCH' && id) {
      const { data, error } = await supabase.from('shared_accesses').update(body).eq('id', id).select('*').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('shared_accesses').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  // 9. /incomes
  if (segments[0] === 'incomes') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      const { data, error } = await supabase.from('incomes').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'POST') {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('incomes').insert({
        ...body,
        created_by: user?.id,
      }).select('*').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'PATCH' && id) {
      const { data, error } = await supabase.from('incomes').update(body).eq('id', id).select('*').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('incomes').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  // 10. /users
  if (segments[0] === 'users') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data || []).map(formatSupabaseRecord) as unknown as T;
    }
    if (method === 'PATCH' && id) {
      const { data, error } = await supabase.from('users').update(body).eq('id', id).select('*').single();
      if (error) throw new Error(error.message);
      return formatSupabaseRecord(data) as unknown as T;
    }
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return undefined as unknown as T;
    }
  }

  throw new Error(`Rota ou método não suportado no Supabase Mobile Adapter: ${method} ${path}`);
}
