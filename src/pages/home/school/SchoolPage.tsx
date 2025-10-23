import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  IonPage,
} from '@ionic/react';
import { add, statsChartOutline } from 'ionicons/icons';
import SubjectSelectionModal from '@/components/navigation/SubjectSelectionModal';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import { Subject } from '@/db/entities';
import {
  useSchool,
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

  const { data: school = null, error: schoolError } = useSchool(schoolId);
  const { data: subjectsData = [], error: subjectsError } =
    useSchoolSubjects(schoolId);
  const [subjects, setSubjects] = useState<Subject[]>(subjectsData);

  const updateSubjectMutation = useUpdateSubject();

  useEffect(() => {
    setSubjects(subjectsData);
  }, [subjectsData]);

  if (schoolError) {
    console.error('Failed to fetch school:', schoolError);
  }
  if (subjectsError) {
    console.error('Failed to fetch subjects:', subjectsError);
  }

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
              <IonItemSliding key={subject.id} className='subject-sliding-card'>
                <IonItem
                  button
                  onClick={() => goToGradesPage(subject)}
                  className="subject-card"
                >
                  <IonCard className="grade-card">
                    <IonCardHeader>
                      <IonCardTitle>{subject.name}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="subject-content-card">
                      <p className="teacher">Lehrperson: {" "}
                        {subject.teacher !== null ? subject.teacher : "Kein Name"} </p>
                      <p className="average-grade">
                        Note:{' '}
                        {average !== undefined ? average + ' Ø' : 'Keine Noten'}
                      </p>
                    </IonCardContent>
                  </IonCard>
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
