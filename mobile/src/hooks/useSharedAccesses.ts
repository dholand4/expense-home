import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sharedAccessService } from '../services/sharedAccessService';

const QUERY_KEY = ['shared-accesses'];

export function useSharedAccesses() {
  const queryClient = useQueryClient();

  const { data: accesses = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: sharedAccessService.list,
  });

  const inviteMutation = useMutation({
    mutationFn: sharedAccessService.invite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const acceptMutation = useMutation({
    mutationFn: sharedAccessService.accept,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const rejectMutation = useMutation({
    mutationFn: sharedAccessService.reject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const revokeMutation = useMutation({
    mutationFn: sharedAccessService.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    accesses,
    isLoading,
    invite: inviteMutation.mutateAsync,
    accept: acceptMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    revoke: revokeMutation.mutateAsync,
  };
}
