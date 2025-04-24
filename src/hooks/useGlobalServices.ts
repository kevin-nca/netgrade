import { useIonAlert } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  GlobalSettingsService,
  Settings,
} from '@/services/GlobalSettingsService';
import { Routes } from '@/routes';

/**
 * Hook that provides access to global services with UI integration
 */
export const useGlobalServices = () => {
  const [presentAlert] = useIonAlert();
  const router = useIonRouter();
  const queryClient = useQueryClient();

  const saveSettings = async (settings: Settings) => {
    try {
      await GlobalSettingsService.saveSettings(settings);
      presentAlert({
        header: 'Einstellungen gespeichert',
        message: 'Ihre Einstellungen wurden erfolgreich gespeichert.',
        buttons: ['OK'],
      });
      return true;
    } catch {
      presentAlert({
        header: 'Fehler',
        message: 'Beim Speichern der Einstellungen ist ein Fehler aufgetreten.',
        buttons: ['OK'],
      });
      return false;
    }
  };

  const resetAllData = async () => {
    return new Promise<boolean>((resolve) => {
      presentAlert({
        header: 'Daten zurücksetzen',
        message:
          'Möchten Sie wirklich alle Daten und Einstellungen zurücksetzen? Dies kann nicht rückgängig gemacht werden.',
        buttons: [
          {
            text: 'Abbrechen',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: 'Zurücksetzen',
            role: 'destructive',
            handler: async () => {
              try {
                await GlobalSettingsService.resetAllData(async () => {
                  await queryClient.invalidateQueries({ queryKey: ['grades'] });
                  await queryClient.invalidateQueries({ queryKey: ['exams'] });
                  await queryClient.invalidateQueries({
                    queryKey: ['subjects'],
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ['schools'],
                  });
                });

                presentAlert({
                  header: 'Erfolgreich zurückgesetzt',
                  message: 'Alle Daten wurden erfolgreich gelöscht.',
                  buttons: [
                    {
                      text: 'OK',
                      handler: () => {
                        router.push(Routes.HOME, 'back');
                        resolve(true);
                      },
                    },
                  ],
                });
              } catch (err) {
                console.error(
                  'Error resetting data:',
                  err instanceof Error ? err.message : String(err),
                );
                presentAlert({
                  header: 'Fehler',
                  message:
                    'Beim Zurücksetzen der Daten ist ein Fehler aufgetreten.',
                  buttons: ['OK'],
                });
                resolve(false);
              }
            },
          },
        ],
      });
    });
  };

  const requestPasswordReset = async (email?: string) => {
    try {
      await GlobalSettingsService.requestPasswordReset(email);
      presentAlert({
        header: 'Passwort ändern',
        message:
          'Eine E-Mail zur ändernung des Passworts wurde an Ihre registrierte E-Mail-Adresse gesendet.',
        buttons: ['OK'],
      });
      return true;
    } catch {
      presentAlert({
        header: 'Fehler',
        message:
          'Beim Anfordern der Passwortänderung ist ein Fehler aufgetreten.',
        buttons: ['OK'],
      });
      return false;
    }
  };

  return {
    settings: {
      getSettings: GlobalSettingsService.getSettings,
      saveSettings,
      resetAllData,
      requestPasswordReset,
    },
  };
};
