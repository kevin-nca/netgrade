import React, { useState } from 'react';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToggle,
  useIonAlert,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';

const SettingsPage: React.FC = () => {
  const [name, setName] = useState('Gabriele');
  const [notification, setNotification] = useState(false);
  const [language, setLanguage] = useState('de');
  const [darkMode, setDarkMode] = useState(false);

  const [presentAlert] = useIonAlert();
  const history = useHistory();

  const handleSave = () => {
    console.log('Settings saved:', {
      name,
      notification,
      language,
      darkMode,
    });
  };

  const resetData = () => {
    presentAlert({
      header: 'Daten zurücksetzen',
      message:
        'Möchten Sie wirklich alle Daten und Einstellungen zurücksetzen?',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Zurücksetzen',
          role: 'destructive',
          handler: () => {
            console.log('Alle Daten wurden zurückgesetzt');
            setName('');
            setNotification(false);
            setLanguage('de');
            setDarkMode(false);
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
        defaultHref={'/main/home'}
      />
      <IonContent fullscreen>
        <IonList>
          <FormField
            label="Benutzername"
            value={name}
            onChange={(e) => setName(e)}
            placeholder="Name eingeben"
            type="text"
          />

          <FormField
            label="Sprache"
            value={language}
            onChange={(e) => setLanguage(e)}
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
