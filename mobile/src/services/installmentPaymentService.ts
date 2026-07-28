import { IInstallmentPayment } from '../@types/models';
import { http } from './httpClient';

type IPaymentBody = Omit<IInstallmentPayment, 'id'>;

export const installmentPaymentService = {
  listByMonth: (monthKey: string) =>
    http.get<IInstallmentPayment[]>(`/installment-payments?month_key=${monthKey}`),
  listAll: () => http.get<IInstallmentPayment[]>('/installment-payments'),
  listByExpense: (expenseId: string) =>
    http.get<IInstallmentPayment[]>(`/installment-payments?expense_id=${expenseId}`),
  create: (data: IPaymentBody) => http.post<IInstallmentPayment>('/installment-payments', data),
  remove: (id: string) => http.delete<void>(`/installment-payments/${id}`),
};
