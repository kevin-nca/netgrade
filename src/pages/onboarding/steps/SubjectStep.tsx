import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonList,
  IonText,
  IonInput,
} from '@ionic/react';
import { checkmarkCircle, add } from 'ionicons/icons';
import { useAddSubject, useSchoolSubjects } from '@/hooks/queries';
import { School } from '@/db/entities';

interface SubjectStepProps {
  selectedSchoolId: string;
  schools: School[];
  showMessage: (
    message: string,
    color?: 'success' | 'danger' | 'warning',
  ) => void;
}

export const SubjectStep: React.FC<SubjectStepProps> = ({
  selectedSchoolId,
  schools,
  showMessage,
}) => {
  const [newSubjectName, setNewSubjectName] = useState('');

  const { data: subjects = [], refetch: refetchSubjects } =
    useSchoolSubjects(selectedSchoolId);
  const addSubjectMutation = useAddSubject();

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  useEffect(() => {
    if (selectedSchoolId) {
      refetchSubjects();
    }
  }, [selectedSchoolId, refetchSubjects]);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      showMessage('Bitte gib einen Fachnamen ein', 'warning');
      return;
    }

    addSubjectMutation.mutate(
      {
        name: newSubjectName.trim(),
        schoolId: selectedSchoolId,
        teacher: null,
        description: null,
        weight: 1.0,
      },
      {
        onSuccess: () => {
          setNewSubjectName('');
          refetchSubjects();
          showMessage('Fach hinzugefügt');
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

  return (
    <IonCard className="ion-no-margin">
      <IonCardContent className="ion-padding">
        <IonItem lines="none" className="ion-no-padding ion-margin-bottom">
          <IonLabel>
            <h5>Schule: {selectedSchool?.name}</h5>
          </IonLabel>
        </IonItem>

        <IonItem lines="none" className="ion-no-padding">
          <IonInput
            value={newSubjectName}
            onIonChange={(e) => setNewSubjectName(e.detail.value || '')}
            placeholder="Neues Fach eingeben"
            className="ion-margin-end"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newSubjectName.trim()) {
                handleAddSubject();
              }
            }}
            disabled={addSubjectMutation.isPending}
          />
          <IonButton
            slot="end"
            size="small"
            onClick={handleAddSubject}
            disabled={!newSubjectName.trim() || addSubjectMutation.isPending}
          >
            {addSubjectMutation.isPending ? '...' : <IonIcon icon={add} />}
          </IonButton>
        </IonItem>

        <IonText className="ion-margin-top">
          <h5>Deine Fächer:</h5>
        </IonText>

        {subjects.length > 0 ? (
          <IonList className="ion-no-padding">
            {subjects.map((subject) => (
              <IonItem
                key={subject.id}
                lines="inset"
                className="ion-no-padding"
              >
                <IonLabel>{subject.name}</IonLabel>
                <IonIcon icon={checkmarkCircle} slot="end" color="success" />
              </IonItem>
            ))}
          </IonList>
        ) : (
          <IonText color="medium" className="ion-padding-top">
            <p>Noch keine Fächer für diese Schule</p>
          </IonText>
        )}
      </IonCardContent>
    </IonCard>
  );
};
