import { IBillAccount } from '../@types/models';
import { http } from './httpClient';

type IBillAccountBody = Omit<IBillAccount, 'id'>;

export const billAccountService = {
  list: () => http.get<IBillAccount[]>('/bill-accounts'),
  create: (data: IBillAccountBody) => http.post<IBillAccount>('/bill-accounts', data),
  update: (id: string, data: Partial<IBillAccountBody>) =>
    http.patch<IBillAccount>(`/bill-accounts/${id}`, data),
  remove: (id: string) => http.delete<void>(`/bill-accounts/${id}`),
};
