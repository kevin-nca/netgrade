import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/react';
import {
  add,
  school,
  chevronForwardOutline,
  bookOutline,
  statsChartOutline,
  timeOutline,
  personCircleOutline,
} from 'ionicons/icons';
import {
  useSchools,
  useGrades,
  useUserName,
  useAddSchool,
  useUpcomingExams,
} from '@/hooks/queries';
import { Routes } from '@/routes';
import { Grade } from '@/db/entities';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import AddSchoolModal from '@/components/modals/AddSchoolModal';
import './HomePage.css';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';

function HomePage() {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [schoolNameInput, setSchoolNameInput] = useState('');
  const history = useHistory();

  const { data: schools = [], refetch: refetchSchools } = useSchools();
  const { data: grades = [], refetch: refetchGrades } = useGrades();
  const { data: userName } = useUserName();
  const addSchoolMutation = useAddSchool();

  const { data: upcomingExams = [], refetch: refetchUpcomingExams } =
    useUpcomingExams();

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await Promise.all([
        refetchSchools(),
        refetchGrades(),
        refetchUpcomingExams(),
      ]);
    } finally {
      event.detail.complete();
    }
  };

  const calculateSchoolAverage = (schoolId: string, grades: Grade[]) => {
    if (!grades || grades.length === 0) return null;

    const schoolGrades = grades.filter(
      (grade) =>
        grade.exam &&
        grade.exam.subject &&
        grade.exam.subject.schoolId &&
        grade.exam.subject.schoolId === schoolId,
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
    return totalWeight ? totalScore / totalWeight : null;
  };

  const getSchoolIcon = (schoolName: string) => {
    return schoolName.charAt(0).toUpperCase();
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Morgen';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} Tagen`;

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
    });
  };

  const handleAddSchool = () => {
    if (schoolNameInput.trim()) {
      addSchoolMutation.mutate(
        { name: schoolNameInput.trim() },
        {
          onSuccess: () => {
            setShowAddSchoolModal(false);
            setSchoolNameInput('');
            refetchSchools();
          },
          onError: (error) => {
            console.error('Fehler beim Hinzufügen:', error);
          },
        },
      );
    }
  };

  return (
    <IonPage className="home-page">
      <IonContent
        className="home-content"
        scrollY={false}
        scrollEvents={false}
        forceOverscroll={false}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        <div className="content-wrapper">
          <div className="header-section">
            <div className="gradient-orb" />
            <div className="profile-card glass-card">
              <div className="profile-content">
                <div className="profile-avatar">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                  <h1 className="profile-greeting">
                    {getGreeting()}
                    {userName ? `, ${userName}` : ''}
                  </h1>
                </div>
                <div
                  className="profile-settings-button"
                  onClick={() => history.push(Routes.SETTINGS)}
                >
                  <IonIcon
                    icon={personCircleOutline}
                    className="profile-icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="main-section">
            <div className="section-header">
              <h2 className="section-title">Schulen</h2>
              <div
                className="header-action-button"
                onClick={() => setShowAddSchoolModal(true)}
              >
                <IonIcon icon={add} className="action-icon" />
              </div>
            </div>

            <div className="schools-grid">
              {schools.length > 0 ? (
                schools.map((school, index) => {
                  const average = calculateSchoolAverage(school.id, grades);
                  return (
                    <div
                      key={school.id}
                      className="school-card glass-card"
                      onClick={() =>
                        history.push(
                          Routes.SCHOOL.replace(':schoolId', school.id),
                        )
                      }
                    >
                      <div className="school-card-header">
                        <div
                          className={`school-avatar school-avatar-${index % 4}`}
                        >
                          {getSchoolIcon(school.name)}
                        </div>
                        <IonIcon
                          icon={chevronForwardOutline}
                          className="school-chevron"
                        />
                      </div>

                      <div className="school-card-content">
                        <h3 className="school-name">{school.name}</h3>
                        <div className="school-stats">
                          <div className="school-average">
                            <IonIcon
                              icon={statsChartOutline}
                              className="stats-icon"
                            />
                            <span className="school-info">
                              {average
                                ? `${average.toFixed(1)} Ø`
                                : 'Keine Noten'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-schools glass-card">
                  <div className="empty-icon-wrapper">
                    <IonIcon icon={school} className="empty-icon" />
                  </div>
                  <h3 className="empty-title">Keine Schulen</h3>
                  <p className="empty-description">Tippe + um zu starten</p>
                </div>
              )}
            </div>
          </div>

          <div className="main-section">
            <div className="section-header">
              <h2 className="section-title">Prüfungen</h2>
              <div
                className="header-action-button"
                onClick={() => history.push(Routes.EXAMS_ADD)}
              >
                <IonIcon icon={add} className="action-icon" />
              </div>
            </div>

            <div className="exams-scroll-container">
              <div className="exams-list">
                {upcomingExams.length > 0 ? (
                  upcomingExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="exam-card glass-card"
                      onClick={() =>
                        history.push(
                          Routes.EXAM_EDIT.replace(':examId', exam.id),
                        )
                      }
                    >
                      <div className="exam-card-content">
                        <div className="exam-icon-and-info">
                          <div className="exam-icon-wrapper">
                            <IonIcon icon={bookOutline} className="exam-icon" />
                          </div>

                          <div className="exam-info">
                            <h4 className="exam-title">{exam.name}</h4>
                            <div className="exam-meta">
                              <div className="exam-date">
                                <IonIcon
                                  icon={timeOutline}
                                  className="meta-icon"
                                />
                                <span>{formatDate(exam.date)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="exam-priority">
                          <div className="priority-dot" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-exams glass-card">
                    <h3 className="empty-title">Alles erledigt!</h3>
                    <p className="empty-description">
                      Keine anstehenden Prüfungen
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bottom-spacer" />
        </div>

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />
      </IonContent>

      <AddSchoolModal
        isOpen={showAddSchoolModal}
        onClose={() => {
          setShowAddSchoolModal(false);
          setSchoolNameInput('');
        }}
        schoolName={schoolNameInput}
        setSchoolName={setSchoolNameInput}
        onAdd={handleAddSchool}
        isLoading={addSchoolMutation.isPending}
      />

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </IonPage>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export default HomePage;
