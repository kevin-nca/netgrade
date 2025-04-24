import React, { useState } from 'react';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToggle,
  useIonAlert,
  useIonRouter,
} from '@ionic/react';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import { Routes } from '@/routes';
import { useResetAllDataMutation } from '@/hooks/queries/useDataManagementQueries';

const SettingsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [notification, setNotification] = useState(false);
  const [language, setLanguage] = useState('de');
  const [darkMode, setDarkMode] = useState(false);

  const [presentAlert] = useIonAlert();
  const router = useIonRouter();

  const resetAllDataMutation = useResetAllDataMutation();

  const handleSave = () => {
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
              await resetAllDataMutation.mutateAsync();

              setName('');
              setNotification(false);
              setLanguage('de');
              setDarkMode(false);

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

  const handleForgotPassword = () => {
    presentAlert({
      header: 'Passwort ändern',
      message:
        'Eine E-Mail zur ändernung des Passworts wurde an Ihre registrierte E-Mail-Adresse gesendet.',
      buttons: ['OK'],
    });
  };

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
            value={name}
            onChange={(value) => setName(String(value))}
            placeholder="Name eingeben"
            type="text"
          />

          <FormField
            label="Sprache"
            value={language}
            onChange={(value) => setLanguage(String(value))}
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
              handleEvent={() => setNotification(!notification)}
              text={notification ? 'Aktiviert' : 'Deaktiviert'}
              fill={notification ? 'solid' : 'outline'}
            />
          </IonItem>

          <IonItem>
            <IonLabel>Dunkelmodus</IonLabel>
            <IonToggle
              checked={darkMode}
              onIonChange={(e) => setDarkMode(e.detail.checked)}
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
