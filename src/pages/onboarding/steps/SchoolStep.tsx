import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import {
  checkmarkCircle,
  arrowForward,
  personCircleOutline,
  schoolOutline,
} from 'ionicons/icons';
import FormField from '@/components/Form/FormField';
import { useSchools, useAddSchool } from '@/hooks';
import styles from './SchoolStep.module.css';
import { Layout } from '@/components/Layout/Layout';

interface SchoolStepProps {
  userName: string;
  selectedSchoolId: string;
  onSchoolSelected: (schoolId: string) => void;
  showMessage: (
    message: string,
    color?: 'success' | 'danger' | 'warning',
  ) => void;
}

export const SchoolStep: React.FC<SchoolStepProps> = ({
  userName,
  selectedSchoolId,
  onSchoolSelected,
  showMessage,
}) => {
  const [schoolName, setSchoolName] = useState('');
  const [localSelectedSchoolId, setLocalSelectedSchoolId] =
    useState(selectedSchoolId);

  const { data: schools = [], refetch: refetchSchools } = useSchools();
  const addSchoolMutation = useAddSchool();

  const handleAddSchool = () => {
    if (!schoolName.trim()) {
      showMessage('Bitte gib einen Schulnamen ein', 'warning');
      return;
    }

    addSchoolMutation.mutate(
      { name: schoolName.trim() },
      {
        onSuccess: () => {
          setSchoolName('');
          refetchSchools();
          showMessage('Schule hinzugefügt');
        },
        onError: (error) => {
          showMessage(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            'danger',
          );
        },
      },
    );
  };

  const handleSchoolClick = (schoolId: string) => {
    setLocalSelectedSchoolId(schoolId);
  };

  const handleProceed = () => {
    if (localSelectedSchoolId) {
      onSchoolSelected(localSelectedSchoolId);
    }
  };

  return (
    <Layout>
      <IonCard className={`ion-no-margin ${styles.container}`}>
        <IonCardContent className="ion-padding">
          <div className={styles.header}>
            <div className={styles.avatar}>
              <IonIcon icon={personCircleOutline} />
            </div>
            <span>Hallo, {userName}</span>
          </div>

          <div className={styles.formField}>
            <FormField
              label="Neue Schule"
              value={schoolName}
              onChange={(value) => setSchoolName(String(value))}
              placeholder="Name der Schule"
            />
          </div>

          <IonButton
            expand="block"
            onClick={handleAddSchool}
            disabled={!schoolName.trim() || addSchoolMutation.isPending}
            size="large"
            className={styles.addButton}
          >
            {addSchoolMutation.isPending ? 'Wird hinzugefügt...' : 'Hinzufügen'}
          </IonButton>

          <IonText className={styles.schoolsTitle}>
            <h5>Verfügbare Schulen:</h5>
          </IonText>

          <div className={styles.schoolList}>
            {schools.length > 0 ? (
              schools.map((school) => (
                <div
                  key={school.id}
                  className={`${styles.schoolItem} ${localSelectedSchoolId === school.id ? styles.selected : ''}`}
                  onClick={() => handleSchoolClick(school.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={localSelectedSchoolId === school.id}
                >
                  <IonIcon
                    icon={schoolOutline}
                    style={{
                      marginRight: 10,
                      fontSize: 22,
                      color:
                        localSelectedSchoolId === school.id
                          ? '#6366f1'
                          : '#a1a1aa',
                    }}
                  />
                  <span>{school.name}</span>
                  {localSelectedSchoolId === school.id && (
                    <IonIcon
                      icon={checkmarkCircle}
                      style={{
                        position: 'absolute',
                        right: 16,
                        color: '#6366f1',
                        fontSize: 24,
                      }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noSchools}>
                <IonIcon
                  icon={schoolOutline}
                  className={styles.noSchoolsIcon}
                />
                <span>Noch keine Schulen</span>
              </div>
            )}
          </div>

          {localSelectedSchoolId && (
            <IonButton
              expand="block"
              onClick={handleProceed}
              className={styles.proceedButton}
              size="large"
            >
              Fächer hinzufügen
              <IonIcon slot="end" icon={arrowForward} />
            </IonButton>
          )}
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};
