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
  useSchool,
  useSchoolSubjects,
  useGrades,
  useAddSubject,
  useDeleteSubject,
} from '@/hooks/queries';
import { Routes } from '@/routes';

interface SubjectToAdd {
  name: string;
}

const SchoolPage: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { schoolId } = useParams<{ schoolId: string }>();
  const history = useHistory();

  const { data: school = null, error: schoolError } = useSchool(schoolId);
  const { data: subjectsData = [], error: subjectsError } =
    useSchoolSubjects(schoolId);
  const [subjects, setSubjects] = useState<Subject[]>(subjectsData);

  const { data: grades = [], error: gradesError } = useGrades();

  useEffect(() => {
    setSubjects(subjectsData);
  }, [subjectsData]);

  if (schoolError) {
    console.error('Failed to fetch school:', schoolError);
  }
  if (subjectsError) {
    console.error('Failed to fetch subjects:', subjectsError);
  }
  if (gradesError) {
    console.error('Failed to fetch grades:', gradesError);
  }

  const goToGradesPage = (subject: Subject) => {
    history.push(
      `${Routes.SUBJECT_GRADES.replace(':schoolId', schoolId).replace(':subjectId', subject.id)}`,
    );
  };

  const calculateAverage = (subject: Subject): number | null => {
    const subjectGrades = grades.filter(
      (grade) => grade.exam.subjectId === subject.id,
    );
    if (subjectGrades.length === 0) return null;
    const totalScore = subjectGrades.reduce(
      (acc, grade) => acc + Number(grade.score) * Number(grade.weight),
      0,
    );
    const totalWeight = subjectGrades.reduce(
      (acc, grade) => acc + Number(grade.weight),
      0,
    );
    return totalWeight > 0 ? totalScore / totalWeight : null;
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
          {subjects.map((subject: Subject) => (
            <IonItemSliding key={subject.id}>
              <IonItem button onClick={() => goToGradesPage(subject)}>
                <IonLabel>
                  <span style={{ float: 'left' }}>{subject.name}</span>
                  <span style={{ float: 'right' }}>
                    Durchschnitt:{' '}
                    {calculateAverage(subject) !== null
                      ? calculateAverage(subject)?.toFixed(2)
                      : 'Keine Noten'}
                  </span>
                </IonLabel>
              </IonItem>
              <IonItemOptions side="end">
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
          ))}
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
      </IonContent>
    </IonPage>
  );
};

export default SchoolPage;
