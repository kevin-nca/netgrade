import { useState } from 'react';
import { DataManagementService } from '@/services';
import { School } from '@/db/entities';
import { ExportOptions } from '@/types/export';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = async (school: School, options: ExportOptions) => {
    try {
      setIsExporting(true);
      setError(null);

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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during export',
      );
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
    error,
  };
}
