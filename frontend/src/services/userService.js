import * as custom from './custom/userService';
import * as supa from './supabase/userService';
import { isSupabase } from '@/api/provider';

const getService = () => (isSupabase ? supa : custom);

export const listUsers = (...args) => getService().listUsers(...args);
export const updateUser = (...args) => getService().updateUser(...args);
export const deleteUser = (...args) => getService().deleteUser(...args);
export const inviteUser = (...args) => getService().inviteUser(...args);
