import React from 'react';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToggle,
} from '@ionic/react';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import { Routes } from '@/routes';
import { useSettingsService } from '@/services/SettingsService';

const SettingsPage: React.FC = () => {
  const { settings, updateSetting, saveSettings, resetData, forgotPassword } =
    useSettingsService();

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
        <Button handleEvent={saveSettings} text={'Speichern'} />
        <Button
          handleEvent={resetData}
          text={'Daten zurücksetzen'}
          color={'danger'}
        />
        <Button
          handleEvent={forgotPassword}
          text={'Passwort ändern?'}
          color={'medium'}
          fill={'clear'}
        />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
