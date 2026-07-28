import { api } from '@/api/httpClient';

export async function listCardInvoicePayments() {
  return api.get('/card-invoice-payments');
}

export async function getCardInvoicePayment(cardId, monthKey) {
  const list = await api.get(
    `/card-invoice-payments?card_id=${encodeURIComponent(cardId)}&month_key=${encodeURIComponent(monthKey)}`
  );
  return list[0] ?? null;
}

export async function createCardInvoicePayment(data) {
  return api.post('/card-invoice-payments', data);
}

export async function updateCardInvoicePayment(id, data) {
  return api.patch(`/card-invoice-payments/${id}`, data);
}

export async function deleteCardInvoicePayment(id) {
  return api.delete(`/card-invoice-payments/${id}`);
}
