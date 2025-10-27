import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import SubjectSelectionModal from '@/components/navigation/SubjectSelectionModal';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import { Subject } from '@/db/entities';
import {
  useSchoolId,
  useSchoolSubjects,
  useAddSubject,
  useDeleteSubject,
  useUpdateSubject,
} from '@/hooks/queries';
import { Routes } from '@/routes';
import EditSubjectModal from '@/components/modals/EditSubjectModal';
import { SchoolService } from '@/services/SchoolService';
import './SchoolPage.css';

interface SubjectToAdd {
  name: string;
}

const SchoolPage: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const { schoolId } = useParams<{ schoolId: string }>();
  const history = useHistory();

  const { data: school } = useSchoolId(schoolId);

  const { data: subjectsData } = useSchoolSubjects(schoolId);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const updateSubjectMutation = useUpdateSubject();

  useEffect(() => {
    if (subjectsData) {
      setSubjects(subjectsData);
    }
  }, [subjectsData]);

  const goToGradesPage = (subject: Subject) => {
    history.push(
      `${Routes.SUBJECT_GRADES.replace(':schoolId', schoolId).replace(':subjectId', subject.id)}`,
    );
  };

  const addSubjectMutation = useAddSubject();

  const addSubjectToStore = (subjectData: SubjectToAdd) => {
    const payload = {
      name: subjectData.name,
      schoolId: schoolId,
      teacher: null,
      description: null,
      weight: 1.0,
    };

    addSubjectMutation.mutate(payload, {
      onSuccess: () => {
        setModalOpen(false);
      },
      onError: (error) => {
        console.error('Failed to add subject:', error);
      },
    });
  };

  const deleteSubjectMutation = useDeleteSubject();

  const removeSubjectFromStore = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    deleteSubjectMutation.mutate(subjectId, {
      onError: (error) => {
        console.error('Failed to remove subject:', error);
      },
    });
  };

  const handleRemoveSubject = (
    subject: Subject,
    slidingItem: HTMLIonItemSlidingElement,
  ) => {
    removeSubjectFromStore(subject.id);
    slidingItem.close();
  };

  return (
    <IonPage>
      <Header
        // 'Schule nicht gefunden' gets shown for a second
        title={school ? school.name : 'Schule nicht gefunden'}
        backButton={true}
        defaultHref={Routes.HOME}
        endSlot={
          <IonButtons slot="end">
            <Button
              handleEvent={() => setModalOpen(true)}
              text={<IonIcon icon={add} />}
            />
          </IonButtons>
        }
      />
      <IonContent>
        <IonList>
          {subjects.map((subject: Subject) => {
            const average = SchoolService.calculateSubjectAverage(subject);

            return (
              <IonItemSliding key={subject.id}>
                <IonItem button onClick={() => goToGradesPage(subject)}>
                  <IonLabel className="glass-card grade-card">
                    <div className="grade-subject">{subject.name}</div>
                    <div className="grade-average">
                      Durchschnitt:{' '}
                      {average !== undefined ? average : 'Keine Noten'}
                    </div>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption
                    color="primary"
                    onClick={() => {
                      setSubjectToEdit(subject);
                      setEditModalOpen(true);
                    }}
                  >
                    Bearbeiten
                  </IonItemOption>
                  <IonItemOption
                    color="danger"
                    onClick={(e) => {
                      const slidingItem = (e.target as Element).closest(
                        'ion-item-sliding',
                      ) as HTMLIonItemSlidingElement;
                      if (slidingItem) {
                        handleRemoveSubject(subject, slidingItem);
                      }
                    }}
                  >
                    Löschen
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            );
          })}
        </IonList>
        <SubjectSelectionModal
          isOpen={isModalOpen}
          setIsOpen={setModalOpen}
          isModule={false}
          subjectsOrModules={subjects}
          addToSubjectsOrModules={addSubjectToStore}
          removeFromSubjectsOrModules={(id: string) =>
            removeSubjectFromStore(id)
          }
          availableSubjects={[]}
        />
        <EditSubjectModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          subject={subjectToEdit}
          onSave={async (newName: string) => {
            if (subjectToEdit) {
              await updateSubjectMutation.mutateAsync({
                id: subjectToEdit.id,
                name: newName,
              });
              setEditModalOpen(false);
              setSubjectToEdit(null);
            }
          }}
          loading={updateSubjectMutation.isPending}
        />
      </IonContent>
    </IonPage>
  );
};

export default SchoolPage;
