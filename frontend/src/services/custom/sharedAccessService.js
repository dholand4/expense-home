import { api } from '@/api/httpClient';

export async function listSharedAccesses(params = {}) {
  const query = new URLSearchParams();
  if (params.owner_email) query.set('owner_email', params.owner_email);
  if (params.shared_with_email) query.set('shared_with_email', params.shared_with_email);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return api.get(`/shared-accesses${qs}`);
}

export async function createSharedAccess(data) {
  return api.post('/shared-accesses', data);
}

export async function updateSharedAccess(id, data) {
  return api.patch(`/shared-accesses/${id}`, data);
}

export async function deleteSharedAccess(id) {
  return api.delete(`/shared-accesses/${id}`);
}
