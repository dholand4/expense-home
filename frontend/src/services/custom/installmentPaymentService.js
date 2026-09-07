import { api } from '@/api/httpClient';

export const listPaymentsByMonth = (monthKey) =>
  api.get(`/installment-payments?month_key=${encodeURIComponent(monthKey)}`);

export const listAllPayments = () =>
  api.get('/installment-payments');

export const listPaymentsByExpense = (expenseId) =>
  api.get(`/installment-payments?expense_id=${encodeURIComponent(expenseId)}`);

export const createPayment = (data) =>
  api.post('/installment-payments', data);

export const deletePayment = (id) =>
  api.delete(`/installment-payments/${id}`);
