import * as custom from './custom/billAccountService';
import * as supa from './supabase/billAccountService';
import { isSupabase } from '@/api/provider';

const getService = () => (isSupabase ? supa : custom);

export const listBillAccounts = (...args) => getService().listBillAccounts(...args);
export const createBillAccount = (...args) => getService().createBillAccount(...args);
export const updateBillAccount = (...args) => getService().updateBillAccount(...args);
export const deleteBillAccount = (...args) => getService().deleteBillAccount(...args);
