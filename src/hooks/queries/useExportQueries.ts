import { useMutation } from '@tanstack/react-query';
import {
  DataManagementService,
  ExportOptions,
} from '@/services/DataManagementService';
import { School } from '@/db/entities';

export function useExportQueries() {
  const exportDataMutation = useMutation({
    mutationFn: async ({
      school,
      options,
    }: {
      school: School;
      options: ExportOptions;
    }) => {
      const blob = await DataManagementService.exportData(school, options);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = options.filename || `school-data.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    },
  });

  return {
    exportDataMutation,
  };
}
