import { ICard } from '../@types/models';
import { http } from './httpClient';

type ICardBody = Omit<ICard, 'id'>;

export const cardService = {
  list: () => http.get<ICard[]>('/cards'),
  create: (data: ICardBody) => http.post<ICard>('/cards', data),
  update: (id: string, data: Partial<ICardBody>) => http.patch<ICard>(`/cards/${id}`, data),
  remove: (id: string) => http.delete<void>(`/cards/${id}`),
};
