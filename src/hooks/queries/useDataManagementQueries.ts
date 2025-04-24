import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DataManagementService } from '@/services/DataManagementService';

export const dataManagementKeys = {
  all: ['dataManagement'] as const,
  resetAll: () => [...dataManagementKeys.all, 'resetAll'] as const,
};

export const useResetAllDataMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void, unknown>({
    mutationFn: async () => {
      await DataManagementService.resetAllData();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['grades'] });
      await queryClient.invalidateQueries({ queryKey: ['exams'] });
      await queryClient.invalidateQueries({ queryKey: ['subjects'] });
      await queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
};
