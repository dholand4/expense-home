import { api } from '@/api/httpClient';

export async function listBillAccounts() {
  return api.get('/bill-accounts');
}

export async function createBillAccount(data) {
  return api.post('/bill-accounts', data);
}

export async function updateBillAccount(id, data) {
  return api.patch(`/bill-accounts/${id}`, data);
}

export async function deleteBillAccount(id) {
  return api.delete(`/bill-accounts/${id}`);
}
