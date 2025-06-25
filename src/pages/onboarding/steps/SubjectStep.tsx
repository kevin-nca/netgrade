import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonInput,
} from '@ionic/react';
import { checkmarkCircle, schoolOutline, bookOutline } from 'ionicons/icons';
import { useAddSubject, useSchoolSubjects } from '@/hooks';
import { School } from '@/db/entities';
import styles from './SubjectStep.module.css';
import { Layout } from '@/components/Layout/Layout';

interface SubjectStepProps {
  selectedSchoolId: string;
  schools: School[];
  showMessage?: (
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
      showMessage?.('Bitte gib einen Fachnamen ein', 'warning');
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
          showMessage?.('Fach hinzugefügt');
        },
        onError: (error) => {
          showMessage?.(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            'danger',
          );
        },
      },
    );
  };

  return (
    <Layout>
      <IonCard className={`ion-no-margin ${styles.container}`}>
        <IonCardContent>
          <div className={styles.header}>
            <IonIcon icon={schoolOutline} className={styles.schoolIcon} />
            <span>Schule: {selectedSchool?.name}</span>
          </div>

          <div className={styles.formRow}>
            <IonInput
              value={newSubjectName}
              onIonChange={(e) => setNewSubjectName(e.detail.value || '')}
              placeholder="Neues Fach eingeben"
              className={styles.input}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSubjectName.trim()) {
                  handleAddSubject();
                }
              }}
              disabled={addSubjectMutation.isPending}
              autoFocus
              maxlength={32}
            />
            <IonButton
              size="default"
              onClick={handleAddSubject}
              disabled={!newSubjectName.trim() || addSubjectMutation.isPending}
              className={styles.addButton}
            >
              {addSubjectMutation.isPending ? (
                '...'
              ) : (
                <IonIcon icon={bookOutline} />
              )}
            </IonButton>
          </div>

          <div className={styles.subjectsTitle}>Deine Fächer:</div>

          {subjects.length > 0 ? (
            <div className={styles.subjectList}>
              {subjects.map((subject) => (
                <div key={subject.id} className={styles.subjectItem}>
                  <IonIcon icon={bookOutline} className="subjectIcon" />
                  <span>{subject.name}</span>
                  <IonIcon icon={checkmarkCircle} className="checkIcon" />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noSubjects}>
              <IonIcon icon={bookOutline} className={styles.noSubjectsIcon} />
              <span>Noch keine Fächer für diese Schule</span>
            </div>
          )}
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};
