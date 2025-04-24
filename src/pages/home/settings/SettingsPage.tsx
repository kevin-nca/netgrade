import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToggle,
  IonSpinner,
} from '@ionic/react';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import { Routes } from '@/routes';
import { Settings } from '@/services/GlobalSettingsService';
import { useGlobalServices } from '@/hooks/useGlobalServices';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const { settings: settingsService } = useGlobalServices();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    const success = await settingsService.saveSettings(settings);
    if (success) {
      await loadSettings();
    }
  };

  const resetData = async () => {
    const success = await settingsService.resetAllData();
    if (success) {
      await loadSettings();
    }
  };

  const handleForgotPassword = () => {
    settingsService.requestPasswordReset();
  };

  if (loading || !settings) {
    return (
      <IonPage>
        <Header
          title={'Einstellungen'}
          backButton={true}
          defaultHref={Routes.HOME}
        />
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
          <p>Einstellungen werden geladen...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <Header
        title={'Einstellungen'}
        backButton={true}
        defaultHref={Routes.HOME}
      />
      <IonContent fullscreen>
        <IonList>
          <FormField
            label="Benutzername"
            value={settings.name}
            onChange={(value) => updateSetting('name', String(value))}
            placeholder="Name eingeben"
            type="text"
          />

          <FormField
            label="Sprache"
            value={settings.language}
            onChange={(value) => updateSetting('language', String(value))}
            placeholder="Sprache wählen"
            type="select"
            options={[
              { value: 'de', label: 'Deutsch' },
              { value: 'en', label: 'Englisch' },
            ]}
          />

          <IonItem>
            <IonLabel>Benachrichtigungen</IonLabel>
            <Button
              handleEvent={() =>
                updateSetting('notification', !settings.notification)
              }
              text={settings.notification ? 'Aktiviert' : 'Deaktiviert'}
              fill={settings.notification ? 'solid' : 'outline'}
            />
          </IonItem>

          <IonItem>
            <IonLabel>Dunkelmodus</IonLabel>
            <IonToggle
              checked={settings.darkMode}
              onIonChange={(e) => updateSetting('darkMode', e.detail.checked)}
            />
          </IonItem>
        </IonList>
        <Button handleEvent={handleSave} text={'Speichern'} />
        <Button
          handleEvent={resetData}
          text={'Daten zurücksetzen'}
          color={'danger'}
        />
        <Button
          handleEvent={handleForgotPassword}
          text={'Passwort ändern?'}
          color={'medium'}
          fill={'clear'}
        />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
