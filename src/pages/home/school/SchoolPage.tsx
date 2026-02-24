import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IonButtons, IonContent, IonIcon, IonPage } from '@ionic/react';
import { add, person, createOutline, trashOutline } from 'ionicons/icons';
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
      semesterId: subjectData.semesterId,
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

  const handleRemoveSubject = (subject: Subject) => {
    deleteSubjectMutation.mutate(subject.id, {
      onError: (error) => {
        console.error('Failed to remove subject:', error);
      },
    });
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
                <div key={subject.id} className="subject-item-container">
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
                      <div className="subject-average-text">
                        Durchschnitt:{' '}
                        {average !== undefined ? `${average}` : '—'}
                      </div>
                    </div>

                    <div className="subject-actions">
                      <button
                        className="subject-action-button edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubjectToEdit(subject);
                          setEditModalOpen(true);
                        }}
                      >
                        <IonIcon icon={createOutline} />
                      </button>
                      <button
                        className="subject-action-button delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSubject(subject);
                        }}
                      >
                        <IonIcon icon={trashOutline} />
                      </button>
                    </div>
                  </div>
                </div>
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
