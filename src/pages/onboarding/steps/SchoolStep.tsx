import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonList,
  IonText,
} from '@ionic/react';
import { checkmarkCircle, arrowForward } from 'ionicons/icons';
import FormField from '@/components/Form/FormField';
import { useSchools, useAddSchool } from '@/hooks';

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
    <IonCard className="ion-no-margin">
      <IonCardContent className="ion-padding">
        <IonItem lines="none" className="ion-no-padding ion-margin-bottom">
          <IonLabel>
            <h5>Hallo, {userName}</h5>
          </IonLabel>
        </IonItem>

        <FormField
          label="Neue Schule"
          value={schoolName}
          onChange={(value) => setSchoolName(String(value))}
          placeholder="Name der Schule"
        />

        <IonButton
          expand="block"
          onClick={handleAddSchool}
          disabled={!schoolName.trim() || addSchoolMutation.isPending}
          size="small"
          className="ion-margin-top"
        >
          {addSchoolMutation.isPending ? 'Wird hinzugefügt...' : 'Hinzufügen'}
        </IonButton>

        <IonText className="ion-margin-top">
          <h5>Verfügbare Schulen:</h5>
        </IonText>

        <IonList className="ion-no-padding">
          {schools.length > 0 ? (
            schools.map((school) => (
              <IonItem
                key={school.id}
                className="ion-no-padding"
                lines="inset"
                onClick={() => handleSchoolClick(school.id)}
                button
                detail={localSelectedSchoolId === school.id}
              >
                <IonLabel>{school.name}</IonLabel>
                {localSelectedSchoolId === school.id && (
                  <IonIcon icon={checkmarkCircle} slot="end" color="primary" />
                )}
              </IonItem>
            ))
          ) : (
            <IonItem lines="none">
              <IonLabel color="medium">Noch keine Schulen</IonLabel>
            </IonItem>
          )}
        </IonList>

        {localSelectedSchoolId && (
          <IonButton
            expand="block"
            onClick={handleProceed}
            className="ion-margin-top"
            size="small"
          >
            Fächer hinzufügen
            <IonIcon slot="end" icon={arrowForward} />
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};
