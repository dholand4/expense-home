import { api } from '@/api/httpClient';

export async function listRunningDebts() {
  return api.get('/running-debts');
}

export async function createRunningDebt(data) {
  return api.post('/running-debts', { ...data, amount_paid: data.amount_paid ?? 0 });
}

export async function updateRunningDebt(id, data) {
  return api.patch(`/running-debts/${id}`, data);
}

export async function deleteRunningDebt(id) {
  return api.delete(`/running-debts/${id}`);
}

export async function listDebtTransactions(debtId) {
  return api.get(`/running-debts/${debtId}/transactions`);
}

export async function addDebtTransaction(data) {
  return api.post('/running-debts/transactions', data);
}

export async function deleteDebtTransaction(id) {
  return api.delete(`/running-debts/transactions/${id}`);
}
