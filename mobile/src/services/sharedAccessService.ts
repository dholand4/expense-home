import { ISharedAccess } from '../@types/models';
import { http } from './httpClient';

export const sharedAccessService = {
  list: () => http.get<ISharedAccess[]>('/shared-accesses'),
  invite: (email: string) => http.post<ISharedAccess>('/shared-accesses', { shared_with_email: email }),
  accept: (id: string) => http.patch<ISharedAccess>(`/shared-accesses/${id}`, { status: 'accepted' }),
  reject: (id: string) => http.patch<ISharedAccess>(`/shared-accesses/${id}`, { status: 'rejected' }),
  revoke: (id: string) => http.delete<void>(`/shared-accesses/${id}`),
};
