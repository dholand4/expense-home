import { ICardInvoicePayment } from '../@types/models';
import { http } from './httpClient';

type IInvoicePaymentBody = Omit<ICardInvoicePayment, 'id'>;

export const cardInvoicePaymentService = {
  list: () => http.get<ICardInvoicePayment[]>('/card-invoice-payments'),
  getByCardAndMonth: (cardId: string, monthKey: string) =>
    http.get<ICardInvoicePayment[]>(
      `/card-invoice-payments?card_id=${cardId}&month_key=${monthKey}`,
    ),
  create: (data: IInvoicePaymentBody) =>
    http.post<ICardInvoicePayment>('/card-invoice-payments', data),
  update: (id: string, data: Partial<IInvoicePaymentBody>) =>
    http.patch<ICardInvoicePayment>(`/card-invoice-payments/${id}`, data),
  remove: (id: string) => http.delete<void>(`/card-invoice-payments/${id}`),
};
