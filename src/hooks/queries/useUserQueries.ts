import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/UserService';

export const userKeys = {
  all: ['user'] as const,
  name: () => [...userKeys.all, 'name'] as const,
};

export const useUserName = () => {
  return useQuery({
    queryKey: userKeys.name(),
    queryFn: () => UserService.getName(),
  });
};

export const useSaveUserName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => UserService.saveName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.name() });
    },
  });
};
