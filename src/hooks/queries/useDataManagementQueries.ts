import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataManagementService,
  ExportOptions,
} from '@/services/DataManagementService';
import { School } from '@/db/entities';

export function useDataManagementQueries() {
  const queryClient = useQueryClient();

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      return await DataManagementService.resetAllData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async ({
      school,
      options,
    }: {
      school: School;
      options: ExportOptions;
    }) => {
      return await DataManagementService.exportData(school, options);
    },
  });

  return {
    resetDataMutation,
    exportDataMutation,
  };
}
