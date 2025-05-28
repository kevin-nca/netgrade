import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataManagementService,
  ExportOptions,
} from '@/services/DataManagementService';
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
  return useMutation<string, Error, { school: School; options: ExportOptions }>(
    {
      mutationFn: async ({ school, options }) => {
        const blob = await DataManagementService.exportData(school, options);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = options.filename || `school-data.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return url;
      },
    },
  );
};
