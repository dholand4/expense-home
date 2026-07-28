import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IInstallmentPayment } from '../@types/models';
import { installmentPaymentService } from '../services/installmentPaymentService';

export function useInstallmentPayments(monthKey?: string) {
  const queryClient = useQueryClient();
  const queryKey = monthKey ? ['installment-payments', monthKey] : ['installment-payments'];

  const { data: payments = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => (monthKey ? installmentPaymentService.listByMonth(monthKey) : installmentPaymentService.listAll()),
  });

  const createMutation = useMutation({
    mutationFn: installmentPaymentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installment-payments'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: installmentPaymentService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installment-payments'] });
    },
  });

  return {
    payments,
    isLoading,
    createPayment: createMutation.mutateAsync,
    removePayment: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
