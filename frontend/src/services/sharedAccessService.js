import * as custom from './custom/sharedAccessService';
import * as supa from './supabase/sharedAccessService';
import { isSupabase } from '@/api/provider';

const getService = () => (isSupabase ? supa : custom);

export const listSharedAccesses = (...args) => getService().listSharedAccesses(...args);
export const createSharedAccess = (...args) => getService().createSharedAccess(...args);
export const updateSharedAccess = (...args) => getService().updateSharedAccess(...args);
export const deleteSharedAccess = (...args) => getService().deleteSharedAccess(...args);
