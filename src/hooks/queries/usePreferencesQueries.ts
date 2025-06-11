import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PreferencesService } from '@/services';

export const preferencesKeys = {
  all: ['preferences'] as const,
  userName: () => [...preferencesKeys.all, 'userName'] as const,
  onboardingCompleted: () =>
    [...preferencesKeys.all, 'onboardingCompleted'] as const,
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

export const useOnboardingCompleted = () => {
  return useQuery({
    queryKey: preferencesKeys.onboardingCompleted(),
    queryFn: () => PreferencesService.isOnboardingCompleted(),
    initialData: () => {
      try {
        const value = localStorage.getItem(
          'CapacitorStorage.onboarding_completed',
        );
        return value === 'true';
      } catch {
        return false;
      }
    },
  });
};

export const useSetOnboardingCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (completed: boolean) =>
      PreferencesService.setOnboardingCompleted(completed),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.onboardingCompleted(),
      });
    },
  });
};
