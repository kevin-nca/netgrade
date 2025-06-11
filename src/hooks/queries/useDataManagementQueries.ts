import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataManagementService,
  ExportOptions,
  ExportFormat,
} from '@/services/DataManagementService';
import { School } from '@/db/entities';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export type { ExportFormat };

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { options: ExportOptions }) => {
      return DataManagementService.exportData(params.options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
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
