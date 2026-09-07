import * as custom from './custom/runningDebtService';
import * as supa from './supabase/runningDebtService';
import { isSupabase } from '@/api/provider';

const getService = () => (isSupabase ? supa : custom);

export const listRunningDebts = (...args) => getService().listRunningDebts(...args);
export const createRunningDebt = (...args) => getService().createRunningDebt(...args);
export const updateRunningDebt = (...args) => getService().updateRunningDebt(...args);
export const deleteRunningDebt = (...args) => getService().deleteRunningDebt(...args);
export const listDebtTransactions = (...args) => getService().listDebtTransactions(...args);
export const addDebtTransaction = (...args) => getService().addDebtTransaction(...args);
export const deleteDebtTransaction = (...args) => getService().deleteDebtTransaction(...args);
