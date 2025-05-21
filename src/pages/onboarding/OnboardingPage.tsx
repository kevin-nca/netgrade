import React, { useState } from 'react';
import {
  IonCard,
  IonContent,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import { useSchools, useAddSchool } from '@/hooks/queries';
import { Routes } from '@/routes';

const OnboardingPage: React.FC = () => {
  const [schoolName, setSchoolName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();

  // Fetch schools using React Query
  const { data: schools = [], error: schoolsError, isLoading } = useSchools();

  const addSchoolMutation = useAddSchool();

  const showAndSetToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleAddSchool = () => {
    if (schoolName.trim()) {
      addSchoolMutation.mutate(
        { name: schoolName.trim() },
        {
          onSuccess: () => {
            setSchoolName('');
            showAndSetToastMessage('Schule erfolgreich hinzugefügt.');
          },
          onError: (error) => {
            showAndSetToastMessage(
              `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            );
          },
        },
      );
    } else {
      showAndSetToastMessage('Bitte geben Sie einen Schulnamen ein.');
    }
  };

  const handleContinue = () => {
    history.push(Routes.HOME);
  };

  return (
    <IonPage>
      <Header title={'Schulen hinzufügen'} backButton={false} />
      <IonContent className="onboarding-container">
        <IonCard className="onboarding-card">
          <FormField
            label={'Name der Schule'}
            value={schoolName}
            onChange={(value) => setSchoolName(String(value))}
            placeholder={'Name der Schule eingeben'}
          />
          <Button
            handleEvent={handleAddSchool}
            text={'Hinzufügen'}
            className="add-button"
          />
        </IonCard>

        <IonCard className="onboarding-card">
          <IonTitle size="small">Hinzugefügte Schulen</IonTitle>
          <IonList>
            {isLoading ? (
              <IonItem>Schulen werden geladen...</IonItem>
            ) : schoolsError ? (
              <IonItem>Fehler beim Laden der Schulen.</IonItem>
            ) : schools.length > 0 ? (
              schools.map((school) => (
                <IonItem key={school.id}>{school.name}</IonItem>
              ))
            ) : (
              <IonItem>Keine Schulen hinzugefügt.</IonItem>
            )}
          </IonList>
        </IonCard>
        <Button
          handleEvent={handleContinue}
          text={'Fortfahren'}
          className="continue-button"
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="primary"
        />
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;
