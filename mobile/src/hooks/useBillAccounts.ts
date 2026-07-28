import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IBillAccount } from '../@types/models';
import { billAccountService } from '../services/billAccountService';

const QUERY_KEY = ['bill-accounts'];

export function useBillAccounts() {
  const queryClient = useQueryClient();

  const { data: billAccounts = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: billAccountService.list,
  });

  const createMutation = useMutation({
    mutationFn: billAccountService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<IBillAccount, 'id'>> }) =>
      billAccountService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: billAccountService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    billAccounts,
    isLoading,
    createBillAccount: createMutation.mutateAsync,
    updateBillAccount: updateMutation.mutateAsync,
    removeBillAccount: removeMutation.mutateAsync,
  };
}
