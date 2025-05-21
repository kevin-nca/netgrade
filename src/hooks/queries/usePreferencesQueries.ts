import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PreferencesService } from '@/services';

export const preferencesKeys = {
  all: ['preferences'] as const,
  userName: () => [...preferencesKeys.all, 'userName'] as const,
};

export const useUserName = () => {
  return useQuery({
    queryKey: preferencesKeys.userName(),
    queryFn: () => PreferencesService.getName(),
  });
};

export const useSaveUserName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => PreferencesService.saveName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferencesKeys.userName() });
    },
  });
};
