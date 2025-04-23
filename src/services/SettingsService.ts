import { useState } from 'react';
import { useIonAlert } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { Routes } from '@/routes';
import { getDataSource } from '@/db/data-source';
import { useQueryClient } from '@tanstack/react-query';

export interface Settings {
  name: string;
  notification: boolean;
  language: string;
  darkMode: boolean;
}

export const useSettingsService = () => {
  const [settings, setSettings] = useState<Settings>({
    name: '',
    notification: false,
    language: 'de',
    darkMode: false,
  });

  const [presentAlert] = useIonAlert();
  const router = useIonRouter();
  const queryClient = useQueryClient();

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    // Save settings logic would go here
    // For now, we just show a success message
    presentAlert({
      header: 'Einstellungen gespeichert',
      message: 'Ihre Einstellungen wurden erfolgreich gespeichert.',
      buttons: ['OK'],
    });
  };

  const resetData = async () => {
    presentAlert({
      header: 'Daten zurücksetzen',
      message:
        'Möchten Sie wirklich alle Daten und Einstellungen zurücksetzen? Dies kann nicht rückgängig gemacht werden.',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Zurücksetzen',
          role: 'destructive',
          handler: async () => {
            try {
              setSettings({
                name: '',
                notification: false,
                language: 'de',
                darkMode: false,
              });

              const dataSource = getDataSource();
              await dataSource.transaction(async (transactionManager) => {
                await transactionManager.query('DELETE FROM grade');
                await transactionManager.query('DELETE FROM exam');
                await transactionManager.query('DELETE FROM subject');
                await transactionManager.query('DELETE FROM school');
              });

              await queryClient.invalidateQueries({ queryKey: ['grades'] });
              await queryClient.invalidateQueries({ queryKey: ['exams'] });
              await queryClient.invalidateQueries({ queryKey: ['subjects'] });
              await queryClient.invalidateQueries({ queryKey: ['schools'] });

              presentAlert({
                header: 'Erfolgreich zurückgesetzt',
                message: 'Alle Daten wurden erfolgreich gelöscht.',
                buttons: [
                  {
                    text: 'OK',
                    handler: () => {
                      router.push(Routes.HOME, 'back');
                    },
                  },
                ],
              });
            } catch (error) {
              console.error('Error resetting data:', error);
              presentAlert({
                header: 'Fehler',
                message:
                  'Beim Zurücksetzen der Daten ist ein Fehler aufgetreten.',
                buttons: ['OK'],
              });
            }
          },
        },
      ],
    });
  };

  const forgotPassword = () => {
    presentAlert({
      header: 'Passwort ändern',
      message:
        'Eine E-Mail zur ändernung des Passworts wurde an Ihre registrierte E-Mail-Adresse gesendet.',
      buttons: ['OK'],
    });
  };

  return {
    settings,
    updateSetting,
    saveSettings,
    resetData,
    forgotPassword,
  };
};
