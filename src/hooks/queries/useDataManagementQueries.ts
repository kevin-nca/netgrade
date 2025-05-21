import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DataManagementService, ExportOptions } from '@/services/DataManagementService';
import { School } from '@/db/entities';

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
  return useMutation<string, Error, { school: School; options: ExportOptions }>({
    mutationFn: async ({ school, options }) => {
      return await DataManagementService.exportData(school, options);
    },
  });
};
