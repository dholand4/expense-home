import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IRunningDebt } from '../@types/models';
import { runningDebtService } from '../services/runningDebtService';

const QUERY_KEY = ['running-debts'];

export function useRunningDebts() {
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: runningDebtService.list,
  });

  const createMutation = useMutation({
    mutationFn: runningDebtService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<IRunningDebt, 'id'>> }) =>
      runningDebtService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: runningDebtService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    debts,
    isLoading,
    createDebt: createMutation.mutateAsync,
    updateDebt: updateMutation.mutateAsync,
    removeDebt: removeMutation.mutateAsync,
  };
}
