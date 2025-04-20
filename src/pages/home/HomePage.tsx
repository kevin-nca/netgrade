import '@/theme/ui-elements.css';
import '@/theme/grade-card.css';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonCard,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import { add, calendar, settings } from 'ionicons/icons';
import ExamList from '@/features/exams/ExamList';
import Button from '@/components/Button/Button';
import { useSchools, useGrades } from '@/hooks/queries';
import { Routes } from '@/routes';
import { Grade } from '@/db/entities';

function HomePage() {
  const [showSlideUp, setShowSlideUp] = useState(false);
  const history = useHistory();

  const { data: schools = [] } = useSchools();
  const { data: grades = [] } = useGrades();

  const openSlideUp = () => setShowSlideUp(true);

  const calculateSchoolAverage = (schoolId: string, grades: Grade[]) => {
    if (!grades || grades.length === 0) return null;

    const schoolGrades = grades.filter(
      (grade) => grade.exam.subject.schoolId === schoolId,
    );
    if (schoolGrades.length === 0) return null;

    const totalScore = schoolGrades.reduce(
      (acc, grade) => acc + grade.score * grade.weight,
      0,
    );
    const totalWeight = schoolGrades.reduce(
      (acc, grade) => acc + grade.weight,
      0,
    );
    return totalWeight ? (totalScore / totalWeight).toFixed(1) : null;
  };

  return (
    <IonPage className="page-background">
      <IonContent fullscreen>
        <IonCard className="welcome-card">
          <div className="welcome-content">
            <h2 className="welcome-title">Willkommen, Arlind</h2>
            <div className="profile-icon"></div>
          </div>
        </IonCard>

        <h2 className="grades-overview-subtitle">Notenübersicht</h2>

        {schools.map((school) => {
          const average = calculateSchoolAverage(school.id, grades);
          return (
            <IonCard key={school.id} className="grade-card">
              <IonItem
                button
                detail
                onClick={() =>
                  history.push(Routes.SCHOOL.replace(':schoolId', school.id))
                }
              >
                <IonLabel>{school.name}</IonLabel>{' '}
                <IonLabel slot="end" className="grade-average">
                  {average !== null ? `${average} Ø` : '-'}
                </IonLabel>
              </IonItem>
            </IonCard>
          );
        })}

        <h2 className="grades-overview-subtitle">Anstehende Prüfungen</h2>
        <ExamList />

        {!showSlideUp && (
          <IonFab
            vertical="bottom"
            horizontal="center"
            slot="fixed"
            className="plus-button"
          >
            <IonFabButton onClick={openSlideUp}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        )}
        <NavigationModal isOpen={showSlideUp} setIsOpen={setShowSlideUp} />
      </IonContent>

      <IonFooter>
        <IonToolbar className="footer-toolbar">
          <Button
            handleEvent={() => history.push(Routes.CALENDAR)}
            text={<IonIcon icon={calendar} />}
            fill={'clear'}
            slot={'start'}
            className="footer-button"
          />

          <IonFab
            vertical="bottom"
            horizontal="center"
            slot="fixed"
            style={{ marginBottom: '-70px' }}
          >
            <IonFabButton className="home-button" onClick={openSlideUp}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          <Button
            handleEvent={() => history.push(Routes.SETTINGS)}
            text={<IonIcon icon={settings} />}
            fill={'clear'}
            slot={'end'}
            className="footer-button"
          />
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
}

export default HomePage;
