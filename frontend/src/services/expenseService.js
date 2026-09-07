import * as custom from './custom/expenseService';
import * as supa from './supabase/expenseService';
import { isSupabase } from '@/api/provider';

const getService = () => (isSupabase ? supa : custom);

export const listExpenses = (...args) => getService().listExpenses(...args);
export const createExpense = (...args) => getService().createExpense(...args);
export const updateExpense = (...args) => getService().updateExpense(...args);
export const deleteExpense = (...args) => getService().deleteExpense(...args);
