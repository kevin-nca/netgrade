import { useMutation } from '@tanstack/react-query';
import {
  DataManagementService,
  ExportOptions,
} from '@/services/DataManagementService';

export const useExportData = () => {
  return useMutation<string, Error, ExportOptions>({
    mutationFn: async (options) => {
      return await DataManagementService.exportData(options);
    },
  });
};
