import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IIncome } from '../@types/models';
import { incomeService, ICreateIncomeBody } from '../services/incomeService';

const QUERY_KEY = ['incomes'];

export function useIncomes() {
  const queryClient = useQueryClient();

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: incomeService.list,
  });

  const createMutation = useMutation({
    mutationFn: incomeService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICreateIncomeBody> }) =>
      incomeService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: incomeService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    incomes,
    isLoading,
    createIncome: createMutation.mutateAsync,
    updateIncome: updateMutation.mutateAsync,
    removeIncome: removeMutation.mutateAsync,
  };
}
