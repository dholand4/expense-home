import { IUser } from '../@types/models';
import { http } from './httpClient';

export const userService = {
  list: () => http.get<IUser[]>('/users'),
  updateRole: (id: string, role: 'user' | 'admin') =>
    http.patch<IUser>(`/users/${id}`, { role }),
  remove: (id: string) => http.delete<void>(`/users/${id}`),
};
