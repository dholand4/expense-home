import * as custom from './custom/installmentPaymentService';
import * as supa from './supabase/installmentPaymentService';
import { isSupabase } from '@/api/provider';

const getService = () => (isSupabase ? supa : custom);

export const listPaymentsByMonth = (...args) => getService().listPaymentsByMonth(...args);
export const listAllPayments = (...args) => getService().listAllPayments(...args);
export const listPaymentsByExpense = (...args) => getService().listPaymentsByExpense(...args);
export const createPayment = (...args) => getService().createPayment(...args);
export const deletePayment = (...args) => getService().deletePayment(...args);
