import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  IonButtons,
  IonContent,
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonPage,
} from '@ionic/react';
import { add, person } from 'ionicons/icons';
import SubjectSelectionModal from '@/features/add-subject/subject-selection-modal';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import { Subject } from '@/db/entities';
import {
  useAddSubject,
  useDeleteSubject,
  useSchool,
  useSchoolSubjects,
  useUpdateSubject,
} from '@/hooks/queries';
import { Routes } from '@/routes';
import EditSubjectModal from '@/features/edit-subject/edit-subject-modal';
import { SchoolService } from '@/services/SchoolService';
import './SchoolPage.css';

const SchoolPage: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const { schoolId } = useParams<{ schoolId: string }>();
  const history = useHistory();

  const { data: school } = useSchool(schoolId);
  const { data: subjects } = useSchoolSubjects(schoolId);

  const addSubjectMutation = useAddSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  const goToGradesPage = (subject: Subject) => {
    history.push(
      `${Routes.SUBJECT_GRADES.replace(':schoolId', schoolId).replace(':subjectId', subject.id)}`,
    );
  };

  const addSubjectToStore = (subjectData: Subject) => {
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

  const handleRemoveSubject = (
    subject: Subject,
    slidingItem: HTMLIonItemSlidingElement,
  ) => {
    deleteSubjectMutation.mutate(subject.id, {
      onError: (error) => {
        console.error('Failed to remove subject:', error);
      },
    });
    slidingItem.close();
  };

  return (
    <IonPage>
      <Header
        title={school!.name}
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
        <div className="subjects-container">
          {subjects!.length > 0 ? (
            subjects!.map((subject: Subject) => {
              const average = SchoolService.calculateSubjectAverage(subject);

              return (
                <IonItemSliding
                  key={subject.id}
                  className="subject-sliding-item"
                >
                  <div
                    className="subject-item"
                    onClick={() => goToGradesPage(subject)}
                  >
                    <div className="subject-icon-badge">
                      <span className="subject-initial">
                        {subject.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="subject-info">
                      <h3 className="subject-name">{subject.name}</h3>
                      <div className="subject-teacher-text">
                        <IonIcon icon={person} />
                        <span>
                          {subject.teacher !== null
                            ? subject.teacher
                            : 'Kein Name'}
                        </span>
                      </div>
                    </div>

                    <div className="subject-average-badge">
                      {average !== undefined ? `${average}` : '—'}
                    </div>
                  </div>

                  <IonItemOptions side="end" className="subject-options">
                    <IonItemOption
                      className="edit-option-slide"
                      onClick={() => {
                        setSubjectToEdit(subject);
                        setEditModalOpen(true);
                      }}
                    >
                      Bearbeiten
                    </IonItemOption>
                    <IonItemOption
                      className="remove-option-slide"
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
            })
          ) : (
            <div className="subjects-empty-state">
              <div className="subjects-empty-icon">
                <IonIcon icon={add} />
              </div>
              <h3>Keine Fächer</h3>
              <p>Füge dein erstes Fach hinzu um zu starten.</p>
            </div>
          )}
        </div>

        <SubjectSelectionModal
          isOpen={isModalOpen}
          setIsOpen={setModalOpen}
          isModule={false}
          subjectsOrModules={subjects!}
          addToSubjectsOrModules={addSubjectToStore}
          removeFromSubjectsOrModules={(id: string) =>
            deleteSubjectMutation.mutate(id, {
              onError: (error) => {
                console.error('Failed to remove subject:', error);
              },
            })
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
