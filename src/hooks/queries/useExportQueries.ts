import { useMutation } from '@tanstack/react-query';
import {
  DataManagementService,
  ExportOptions,
} from '@/services/DataManagementService';
import { School } from '@/db/entities';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const useExportData = () => {
  return useMutation({
    mutationFn: async ({
      school,
      options,
    }: {
      school: School;
      options: ExportOptions;
    }) => {
      const data = await DataManagementService.exportData(school, options);
      const blob = new Blob([data], { type: 'application/octet-stream' });

      if (Capacitor.isNativePlatform()) {
        const base64Data = await blobToBase64(blob);
        const fileName = options.filename || `school-data.${options.format}`;

        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });

        return true;
      } 
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
