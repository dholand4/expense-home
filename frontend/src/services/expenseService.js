import { api } from '@/api/httpClient';

export async function listExpenses() {
  return api.get('/expenses');
}

export async function createExpense(data) {
  return api.post('/expenses', data);
}

export async function updateExpense(id, data) {
  return api.patch(`/expenses/${id}`, data);
}

export async function deleteExpense(id) {
  return api.delete(`/expenses/${id}`);
}
