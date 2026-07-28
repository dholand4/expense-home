import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ICard } from '../@types/models';
import { cardService } from '../services/cardService';

const QUERY_KEY = ['cards'];

export function useCards() {
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: cardService.list,
  });

  const createMutation = useMutation({
    mutationFn: cardService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ICard, 'id'>> }) =>
      cardService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: cardService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    cards,
    isLoading,
    createCard: createMutation.mutateAsync,
    updateCard: updateMutation.mutateAsync,
    removeCard: removeMutation.mutateAsync,
  };
}
