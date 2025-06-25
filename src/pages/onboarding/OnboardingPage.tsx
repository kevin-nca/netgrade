import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonToast,
  IonProgressBar,
  IonIcon,
  IonChip,
  IonLabel,
  IonButtons,
  IonFooter,
} from '@ionic/react';
import { arrowBack, personCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

import { NameStep } from './steps/NameStep';
import { SchoolStep } from './steps/SchoolStep';
import { SubjectStep } from './steps/SubjectStep';

import {
  useUserName,
  useSchools,
  useSetOnboardingCompleted,
} from '@/hooks/queries';
import { Routes } from '@/routes';
import { Layout } from '@/components/Layout/Layout';

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'name' | 'school' | 'subject'>(
    'name',
  );
  const [userName, setUserName] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<
    'success' | 'danger' | 'warning'
  >('success');

  const history = useHistory();
  const { data: savedUserName } = useUserName();
  const { data: schools = [] } = useSchools();
  const setOnboardingCompletedMutation = useSetOnboardingCompleted();

  const canCompleteOnboarding = (): boolean => {
    return !!userName && userName.trim().length > 0 && schools.length > 0;
  };

  useEffect(() => {
    if (savedUserName) {
      setUserName(savedUserName);
      if (currentStep === 'name') {
        setCurrentStep('school');
      }
    }
  }, [savedUserName, currentStep]);

  const showMessage = (
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success',
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const getProgress = (): number => {
    switch (currentStep) {
      case 'name':
        return 0.33;
      case 'school':
        return 0.66;
      case 'subject':
        return 1;
      default:
        return 0;
    }
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      case 'name':
        return 'Dein Name';
      case 'school':
        return 'Deine Schulen';
      case 'subject':
        return 'Deine Fächer';
      default:
        return '';
    }
  };

  const goToNextStep = (step: 'name' | 'school' | 'subject') => {
    setCurrentStep(step);
  };

  const handleBackStep = () => {
    if (currentStep === 'school') {
      setCurrentStep('name');
    } else if (currentStep === 'subject') {
      setCurrentStep('school');
    }
  };

  const handleCompleteOnboarding = () => {
    setOnboardingCompletedMutation.mutate(true, {
      onSuccess: () => {
        history.push(Routes.HOME);
      },
      onError: (error) => {
        console.error('Failed to mark onboarding as completed:', error);
        showMessage(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          'danger',
        );
      },
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'name':
        return (
          <NameStep
            initialName={userName}
            onNameSaved={(name) => {
              setUserName(name);
              showMessage('Name gespeichert');
              goToNextStep('school');
            }}
            showMessage={showMessage}
          />
        );
      case 'school':
        return (
          <SchoolStep
            userName={userName}
            selectedSchoolId={selectedSchoolId}
            onSchoolSelected={(schoolId) => {
              setSelectedSchoolId(schoolId);
              goToNextStep('subject');
            }}
            showMessage={showMessage}
          />
        );
      case 'subject':
        return (
          <SubjectStep
            selectedSchoolId={selectedSchoolId}
            schools={schools}
            showMessage={showMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {currentStep !== 'name' && (
              <IonButton onClick={handleBackStep}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            )}
          </IonButtons>

          <IonTitle size="small">{getStepTitle()}</IonTitle>

          {userName && currentStep !== 'name' && (
            <IonChip slot="end" color="primary">
              <IonIcon icon={personCircle} />
              <IonLabel>{userName}</IonLabel>
            </IonChip>
          )}
        </IonToolbar>
        <IonProgressBar value={getProgress()} />
      </IonHeader>

      <IonContent>
        <Layout>{renderCurrentStep()}</Layout>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastColor}
          position="bottom"
        />
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButton
            expand="block"
            color="success"
            onClick={handleCompleteOnboarding}
            disabled={!canCompleteOnboarding()}
            className="ion-margin-horizontal"
            size="default"
          >
            Onboarding abschliessen
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default OnboardingPage;
