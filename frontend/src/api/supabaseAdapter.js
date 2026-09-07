import { supabase } from './supabaseClient';
import * as cardService from '@/services/supabase/cardService';
import * as billAccountService from '@/services/supabase/billAccountService';
import * as expenseService from '@/services/supabase/expenseService';
import * as installmentPaymentService from '@/services/supabase/installmentPaymentService';
import * as cardInvoicePaymentService from '@/services/supabase/cardInvoicePaymentService';
import * as runningDebtService from '@/services/supabase/runningDebtService';
import * as sharedAccessService from '@/services/supabase/sharedAccessService';
import * as userService from '@/services/supabase/userService';

export async function handleSupabaseRequest(method, path, body) {
  if (!supabase) {
    throw new Error('Supabase não está configurado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }

  const [pathWithoutQuery, queryString] = path.split('?');
  const searchParams = new URLSearchParams(queryString || '');
  const segments = pathWithoutQuery.split('/').filter(Boolean);

  // 1. /auth
  if (segments[0] === 'auth') {
    const action = segments[1];
    if (action === 'forgot-password') {
      const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      return { success: true };
    }
    if (action === 'reset-password' || action === 'accept-invite') {
      const { error } = await supabase.auth.updateUser({ password: body.password });
      if (error) throw new Error(error.message);
      return { success: true };
    }
    if (action === 'invite') {
      return userService.inviteUser(body.email, body.role);
    }
    if (action === 'me') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: data?.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
          role: data?.role || 'user',
          status: data?.status || 'active',
        },
      };
    }
  }

  // 2. /users
  if (segments[0] === 'users') {
    const id = segments[1];
    if (method === 'GET' && !id) return userService.listUsers();
    if (method === 'PATCH' && id) return userService.updateUser(id, body);
    if (method === 'DELETE' && id) return userService.deleteUser(id);
  }

  // 3. /shared-accesses
  if (segments[0] === 'shared-accesses') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      return sharedAccessService.listSharedAccesses({
        owner_email: searchParams.get('owner_email'),
        shared_with_email: searchParams.get('shared_with_email'),
      });
    }
    if (method === 'POST') return sharedAccessService.createSharedAccess(body);
    if (method === 'PATCH' && id) return sharedAccessService.updateSharedAccess(id, body);
    if (method === 'DELETE' && id) return sharedAccessService.deleteSharedAccess(id);
  }

  // 4. /cards
  if (segments[0] === 'cards') {
    const id = segments[1];
    if (method === 'GET' && !id) return cardService.listCards();
    if (method === 'POST') return cardService.createCard(body);
    if (method === 'PATCH' && id) return cardService.updateCard(id, body);
    if (method === 'DELETE' && id) return cardService.deleteCard(id);
  }

  // 5. /bill-accounts
  if (segments[0] === 'bill-accounts') {
    const id = segments[1];
    if (method === 'GET' && !id) return billAccountService.listBillAccounts();
    if (method === 'POST') return billAccountService.createBillAccount(body);
    if (method === 'PATCH' && id) return billAccountService.updateBillAccount(id, body);
    if (method === 'DELETE' && id) return billAccountService.deleteBillAccount(id);
  }

  // 6. /expenses
  if (segments[0] === 'expenses') {
    const id = segments[1];
    if (method === 'GET' && !id) return expenseService.listExpenses();
    if (method === 'POST') return expenseService.createExpense(body);
    if (method === 'PATCH' && id) return expenseService.updateExpense(id, body);
    if (method === 'DELETE' && id) return expenseService.deleteExpense(id);
  }

  // 7. /installment-payments
  if (segments[0] === 'installment-payments') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      const monthKey = searchParams.get('month_key');
      const expenseId = searchParams.get('expense_id');
      if (monthKey) return installmentPaymentService.listPaymentsByMonth(monthKey);
      if (expenseId) return installmentPaymentService.listPaymentsByExpense(expenseId);
      return installmentPaymentService.listAllPayments();
    }
    if (method === 'POST') return installmentPaymentService.createPayment(body);
    if (method === 'DELETE' && id) return installmentPaymentService.deletePayment(id);
  }

  // 8. /card-invoice-payments
  if (segments[0] === 'card-invoice-payments') {
    const id = segments[1];
    if (method === 'GET' && !id) {
      const cardId = searchParams.get('card_id');
      const monthKey = searchParams.get('month_key');
      if (cardId && monthKey) return [await cardInvoicePaymentService.getCardInvoicePayment(cardId, monthKey)].filter(Boolean);
      return cardInvoicePaymentService.listCardInvoicePayments();
    }
    if (method === 'POST') return cardInvoicePaymentService.createCardInvoicePayment(body);
    if (method === 'PATCH' && id) return cardInvoicePaymentService.updateCardInvoicePayment(id, body);
    if (method === 'DELETE' && id) return cardInvoicePaymentService.deleteCardInvoicePayment(id);
  }

  // 9. /running-debts
  if (segments[0] === 'running-debts') {
    const id = segments[1];
    const sub = segments[2];

    if (id && sub === 'transactions' && method === 'GET') {
      return runningDebtService.listDebtTransactions(id);
    }
    if (id === 'transactions') {
      if (method === 'POST') return runningDebtService.addDebtTransaction(body);
      if (method === 'DELETE' && sub) return runningDebtService.deleteDebtTransaction(sub);
    }

    if (method === 'GET' && !id) return runningDebtService.listRunningDebts();
    if (method === 'POST') return runningDebtService.createRunningDebt(body);
    if (method === 'PATCH' && id) return runningDebtService.updateRunningDebt(id, body);
    if (method === 'DELETE' && id) return runningDebtService.deleteRunningDebt(id);
  }

  throw new Error(`Rota ou método não suportado no SupabaseAdapter: ${method} ${path}`);
}
