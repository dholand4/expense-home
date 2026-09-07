import { api } from '@/api/httpClient';

export async function listUsers() {
  return api.get('/users');
}

export async function updateUser(id, data) {
  return api.patch(`/users/${id}`, data);
}

export async function deleteUser(id) {
  return api.delete(`/users/${id}`);
}

export async function inviteUser(email, role = 'user') {
  return api.post('/auth/invite', { email, role });
}
