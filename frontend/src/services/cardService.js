import { api } from '@/api/httpClient';

export async function listCards() {
  return api.get('/cards');
}

export async function createCard(data) {
  return api.post('/cards', data);
}

export async function updateCard(id, data) {
  return api.patch(`/cards/${id}`, data);
}

export async function deleteCard(id) {
  // Backend deletes linked expenses + payments in a transaction
  return api.delete(`/cards/${id}`);
}
