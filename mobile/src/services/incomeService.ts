import { IIncome } from '../@types/models';
import { http } from './httpClient';

export type ICreateIncomeBody = Omit<IIncome, 'id'>;

export const incomeService = {
  list: () => http.get<IIncome[]>('/incomes'),
  create: (data: ICreateIncomeBody) => http.post<IIncome>('/incomes', data),
  update: (id: string, data: Partial<ICreateIncomeBody>) => http.patch<IIncome>(`/incomes/${id}`, data),
  remove: (id: string) => http.delete<void>(`/incomes/${id}`),
};
