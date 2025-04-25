import { useState, useEffect, useCallback } from 'react';
import { SettingsService, UserSettings } from '@/services/SettingsService';

export type ToastType = 'success' | 'error';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(
    SettingsService.loadSettings(),
  );
  const [toastState, setToastState] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType,
  });

  useEffect(() => {
    SettingsService.applyLanguage(settings.language);
  }, [settings.language]);

  const showToast = useCallback((message: string, isSuccess = true) => {
    setToastState({
      show: true,
      message,
      type: (isSuccess ? 'success' : 'error') as ToastType,
    });

    setTimeout(() => {
      setToastState((prev) => ({ ...prev, show: false }));
    }, 2000);
  }, []);

  const updateSettings = useCallback(
    (field: keyof UserSettings, value: any) => {
      const updatedSettings = {
        ...settings,
        [field]: value,
      };

      setSettings(updatedSettings);

      if (field === 'language') {
        SettingsService.applyLanguage(value);
      }
    },
    [settings],
  );

  const saveSettings = useCallback(() => {
    const success = SettingsService.saveSettings();

    if (success) {
      showToast('Einstellungen erfolgreich gespeichert');
      return true;
    } else {
      showToast('Fehler beim Speichern der Einstellungen', false);
      return false;
    }
  }, [settings, showToast]);

  const resetSettings = useCallback(() => {
    const defaultSettings: UserSettings = {
      name: '',
      language: 'de',
      notifications: false,
      darkMode: false,
    };

    return setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    toastState,
    showToast,
  };
}
