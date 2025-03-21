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
import { useSelector } from 'react-redux';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import { add, calendar, settings } from 'ionicons/icons';
import { RootState } from '@/store';
import ExamOrUpcomingEventList from '@/features/exam-or-upcoming-event/ExamOrUpcomingEventList';
import Button from '@/components/Button/Button';
import '../../theme/ui-elements.css';
import '../../theme/grade-card.css';

interface Grade {
  score: number;
  weight: number;
}

interface GradesState {
  [key: string]: Record<string, Grade[]>;
}

function homePage() {
  const [showSlideUp, setShowSlideUp] = useState(false);
  const history = useHistory();

  const openSlideUp = () => setShowSlideUp(true);

  const schools = useSelector((state: RootState) => state.schools.schools);
  const grades = useSelector((state: RootState) => state.grades);

  const calculateAverage = (grades: Grade[]) => {
    if (!grades || Object.keys(grades).length === 0) return null;

    const allGrades = Object.values(grades).flat();
    if (allGrades.length === 0) return null;

    const totalScore = allGrades.reduce(
      (acc, grade) => acc + grade.score * grade.weight,
      0,
    );
    const totalWeight = allGrades.reduce((acc, grade) => acc + grade.weight, 0);
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
          const average = calculateAverage(grades[school.id]);
          return (
            <IonCard key={school.id} className="grade-card">
              <IonItem
                button
                detail
                onClick={() => history.push(`/main/home/${school.id}`)}
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
        <ExamOrUpcomingEventList />

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
            handleEvent={() => history.push('/main/home/calendar')}
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
            handleEvent={() => history.push('/main/home/settings')}
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

export default homePage;
