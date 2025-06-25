import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataManagementService,
  ExportOptions,
  ExportResult,
} from '@/services/DataManagementService';

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
export const useExportData = () => {
  return useMutation<ExportResult, Error, { options: ExportOptions }>({
    mutationFn: async ({ options }) => {
      return await DataManagementService.exportData(options);
    },
  });
};
