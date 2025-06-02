import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataManagementService,
  ExportOptions,
} from '@/services/DataManagementService';
import { School } from '@/db/entities';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
  return useMutation<boolean, Error, { school: School; options: ExportOptions }>({
    mutationFn: async ({ school, options }) => {
      const data = await DataManagementService.exportData(school, options);
      const blob = new Blob([data], { type: 'application/octet-stream' });

      if (Capacitor.isNativePlatform()) {
        const base64Data = await blobToBase64(blob);
        const fileName = options.filename || `school-data.${options.format}`;
        
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true
        });

        return true;
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = options.filename || `school-data.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
      }
    },
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
