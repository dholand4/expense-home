import * as custom from './custom/cardInvoicePaymentService';
import * as supa from './supabase/cardInvoicePaymentService';
import { isSupabase } from '@/api/provider';

const getService = () => (isSupabase ? supa : custom);

export const listCardInvoicePayments = (...args) => getService().listCardInvoicePayments(...args);
export const getCardInvoicePayment = (...args) => getService().getCardInvoicePayment(...args);
export const createCardInvoicePayment = (...args) => getService().createCardInvoicePayment(...args);
export const updateCardInvoicePayment = (...args) => getService().updateCardInvoicePayment(...args);
export const deleteCardInvoicePayment = (...args) => getService().deleteCardInvoicePayment(...args);
