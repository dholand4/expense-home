import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IExpense } from '../@types/models';
import { expenseService } from '../services/expenseService';

const QUERY_KEY = ['expenses'];

export function useExpenses() {
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: expenseService.list,
  });

  const createMutation = useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<IExpense, 'id'>> }) =>
      expenseService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: expenseService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    expenses,
    isLoading,
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    removeExpense: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
