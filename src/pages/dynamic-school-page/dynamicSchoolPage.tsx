// dynamicSchoolPage.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { addSubject, removeSubject, Subject } from '@/store/subjectsSlice';
import { RootState } from '@/store';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';

const DynamicSchoolPage: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { schoolId } = useParams<{ schoolId: string }>();
  const school = useSelector((state: RootState) =>
    state.schools.schools.find((s) => s.id === schoolId),
  );
  const dispatch = useDispatch();
  const subjects: Subject[] = useSelector(
    (state: RootState) => state.subjects[schoolId] || [],
  );
  const grades = useSelector((state: RootState) => state.grades || []);
  const history = useHistory();
  const goToGradesPage = (subject: Subject) => {
    history.push(`/main/home/grades/grade-entry/${schoolId}/${subject.id}`);
  };
  const calculateAverage = (subject: Subject): number | null => {
    if (!grades[schoolId]) return null;
    const subjectGrades = grades[schoolId].filter(
      (grade) => grade.subject === subject.id,
    );
    if (subjectGrades.length === 0) return null;
    const totalScore = subjectGrades.reduce(
      (acc, grade) => acc + grade.score * grade.weight,
      0,
    );
    const totalWeight = subjectGrades.reduce(
      (acc, grade) => acc + grade.weight,
      0,
    );
    return totalWeight > 0 ? totalScore / totalWeight : null;
  };
  const addSubjectToStore = (subject: Subject) => {
    dispatch(addSubject({ schoolId: schoolId, subjectName: subject.name }));
  };
  const removeSubjectFromStore = (subjectId: string) => {
    dispatch(removeSubject({ schoolId: schoolId, subjectId }));
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
        defaultHref={'/main/home'}
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
              <IonItem onClick={() => goToGradesPage(subject)}>
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
          removeFromSubjectsOrModules={removeSubjectFromStore}
          availableSubjects={subjects.map((subject) => subject.name)}
        />
      </IonContent>
    </IonPage>
  );
};

export default DynamicSchoolPage;
