import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ICardInvoicePayment } from '../@types/models';
import { cardInvoicePaymentService } from '../services/cardInvoicePaymentService';

const QUERY_KEY = ['card-invoice-payments'];

export function useCardInvoicePayments() {
  const queryClient = useQueryClient();

  const { data: invoicePayments = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: cardInvoicePaymentService.list,
  });

  const createMutation = useMutation({
    mutationFn: cardInvoicePaymentService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ICardInvoicePayment, 'id'>> }) =>
      cardInvoicePaymentService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: cardInvoicePaymentService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    invoicePayments,
    isLoading,
    createInvoicePayment: createMutation.mutateAsync,
    updateInvoicePayment: updateMutation.mutateAsync,
    removeInvoicePayment: removeMutation.mutateAsync,
  };
}
