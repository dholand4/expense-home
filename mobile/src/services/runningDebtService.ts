import { IRunningDebt } from '../@types/models';
import { http } from './httpClient';

type IRunningDebtBody = Omit<IRunningDebt, 'id'>;

export const runningDebtService = {
  list: () => http.get<IRunningDebt[]>('/running-debts'),
  create: (data: IRunningDebtBody) => http.post<IRunningDebt>('/running-debts', data),
  update: (id: string, data: Partial<IRunningDebtBody>) =>
    http.patch<IRunningDebt>(`/running-debts/${id}`, data),
  remove: (id: string) => http.delete<void>(`/running-debts/${id}`),
};
