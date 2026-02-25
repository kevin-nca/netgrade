import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonIcon,
  IonToast,
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import {
  useSaveUserName,
  useAddSchool,
  useAddSubject,
  useSetOnboardingCompleted,
} from '@/hooks/queries';
import { Routes } from '@/routes';
import { School } from '@/db/entities';

import WelcomeScreen from './components/welcomeScreen/WelcomeScreen';
import NameStep from './components/nameStep/NameStep';
import SchoolStep from './components/schoolStep/SchoolStep';
import SubjectStep from './components/subjectStep/SubjectStep';
import CompletionStep from './components/completionStep/CompletionStep';
import ProgressBar from './components/progressbar/ProgressBar';

import { OnboardingDataTemp } from './types';
import './OnboardingPage.css';
import './components/SharedStepStyles.css';

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingDataTemp>({
    userName: '',
    schools: [],
    subjects: [],
  });
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<
    'success' | 'danger' | 'warning'
  >('success');

  const history = useHistory();
  const saveUserNameMutation = useSaveUserName();
  const addSchoolMutation = useAddSchool();
  const addSubjectMutation = useAddSubject();
  const setOnboardingCompletedMutation = useSetOnboardingCompleted();

  const totalSteps = 5;

  const showToastMessage = (
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success',
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Willkommen';
      case 1:
        return 'Dein Name';
      case 2:
        return 'Schulen';
      case 3:
        return 'Fächer';
      case 4:
        return 'Fertig';
      default:
        return 'Einrichtung';
    }
  };

  const handleBackStep = () => {
    if (currentStep > 0 && !isCompleting) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      // Save user name

      saveUserNameMutation.mutate(data.userName);

      // Save schools and map temp IDs to real IDs
      const schoolIdMapping: { [tempId: string]: string } = {};

      for (const school of data.schools) {
        const savedSchool = await new Promise<School>((resolve, reject) => {
          addSchoolMutation.mutate(
            {
              name: school.name,
              address: school.address || undefined,
              type: school.type || undefined,
            },
            {
              onSuccess: (result) => resolve(result),
              onError: reject,
            },
          );
        });

        schoolIdMapping[school.id] = savedSchool.id;
      }

      // Save subjects with correct schoolId references
      for (const subject of data.subjects) {
        const realSchoolId = schoolIdMapping[subject.schoolId];

        if (!realSchoolId) {
          throw new Error(
            `Could not find real school ID for subject: ${subject.name}`,
          );
        }

        addSubjectMutation.mutate({
          name: subject.name,
          schoolId: realSchoolId,
          teacher: subject.teacher || null,
          description: subject.description || null,
        });
      }

      // Mark onboarding as complete
      setOnboardingCompletedMutation.mutate(true);

      setTimeout(() => {
        history.replace(Routes.HOME);
      }, 1000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      showToastMessage(
        'Fehler beim Speichern. Bitte versuche es erneut.',
        'danger',
      );
      setIsCompleting(false);
    }
  };

  return (
    <IonPage className="onboarding-page">
      {/* Header - only show for steps 1+ */}
      {currentStep > 0 && (
        <IonHeader className="onboarding-header">
          <IonToolbar className="onboarding-toolbar">
            <IonButtons slot="start">
              <IonButton
                fill="clear"
                onClick={handleBackStep}
                disabled={isCompleting}
                className="back-button"
              >
                <IonIcon icon={arrowBack} className="back-icon" />
              </IonButton>
            </IonButtons>

            <IonTitle className="onboarding-title">{getStepTitle()}</IonTitle>

            <div slot="end" className="step-indicator">
              <span className="step-counter">
                {currentStep}/{totalSteps - 1}
              </span>
            </div>
          </IonToolbar>

          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </IonHeader>
      )}

      <IonContent className="onboarding-content" scrollY={currentStep === 3}>
        <div className="onboarding-container">
          {currentStep === 0 && <WelcomeScreen onNext={handleNextStep} />}
          {currentStep === 1 && (
            <NameStep data={data} setData={setData} onNext={handleNextStep} />
          )}
          {currentStep === 2 && (
            <SchoolStep
              data={data}
              setData={setData}
              selectedSchoolId={selectedSchoolId}
              setSelectedSchoolId={setSelectedSchoolId}
              generateId={generateId}
              onNext={handleNextStep}
            />
          )}
          {currentStep === 3 && (
            <SubjectStep
              data={data}
              setData={setData}
              selectedSchoolId={selectedSchoolId}
              setSelectedSchoolId={setSelectedSchoolId}
              generateId={generateId}
              onNext={handleNextStep}
            />
          )}
          {currentStep === 4 && (
            <CompletionStep
              data={data}
              isCompleting={isCompleting}
              onComplete={handleComplete}
            />
          )}
        </div>
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
        color={toastColor}
      />
    </IonPage>
  );
};

export default OnboardingPage;
