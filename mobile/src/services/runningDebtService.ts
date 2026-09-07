import { IRunningDebt, IRunningDebtTransaction } from '../@types/models';
import { http } from './httpClient';

type IRunningDebtBody = Omit<IRunningDebt, 'id'>;

export interface ICreateDebtTransactionBody {
  debt_id: string;
  type: 'charge' | 'payment';
  amount: number;
  date?: string;
  notes?: string;
}

export const runningDebtService = {
  list: () => http.get<IRunningDebt[]>('/running-debts'),
  create: (data: IRunningDebtBody) => http.post<IRunningDebt>('/running-debts', data),
  update: (id: string, data: Partial<IRunningDebtBody>) =>
    http.patch<IRunningDebt>(`/running-debts/${id}`, data),
  remove: (id: string) => http.delete<void>(`/running-debts/${id}`),

  listTransactions: (debtId: string) =>
    http.get<IRunningDebtTransaction[]>(`/running-debts/${debtId}/transactions`),
  addTransaction: (data: ICreateDebtTransactionBody) =>
    http.post<IRunningDebtTransaction>('/running-debts/transactions', data),
  removeTransaction: (id: string) =>
    http.delete<void>(`/running-debts/transactions/${id}`),
};
