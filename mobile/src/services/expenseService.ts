import { IExpense } from '../@types/models';
import { http } from './httpClient';

type IExpenseBody = Omit<IExpense, 'id'>;

export const expenseService = {
  list: () => http.get<IExpense[]>('/expenses'),
  create: (data: IExpenseBody) => http.post<IExpense>('/expenses', data),
  update: (id: string, data: Partial<IExpenseBody>) =>
    http.patch<IExpense>(`/expenses/${id}`, data),
  remove: (id: string) => http.delete<void>(`/expenses/${id}`),
};
