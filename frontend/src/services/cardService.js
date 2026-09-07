import * as custom from './custom/cardService';
import * as supa from './supabase/cardService';
import { isSupabase } from '@/api/provider';

const getService = () => (isSupabase ? supa : custom);

export const listCards = (...args) => getService().listCards(...args);
export const createCard = (...args) => getService().createCard(...args);
export const updateCard = (...args) => getService().updateCard(...args);
export const deleteCard = (...args) => getService().deleteCard(...args);
