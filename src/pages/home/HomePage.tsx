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
  calendar,
  settings,
  school,
  chevronForwardOutline,
  trophyOutline,
  bookOutline,
  statsChartOutline,
  timeOutline,
  homeOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { useSchools, useGrades, useUserName, useExams } from '@/hooks/queries';
import { Routes } from '@/routes';
import { Grade } from '@/db/entities';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import './HomePage.css';

function HomePage() {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const history = useHistory();

  const { data: schools = [], refetch: refetchSchools } = useSchools();
  const { data: grades = [], refetch: refetchGrades } = useGrades();
  const { data: userName } = useUserName();
  const { data: allExams = [], refetch: refetchExams } = useExams();

  const upcomingExams = allExams
    .filter((exam) => !exam.isCompleted)
    .slice(0, 3);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await Promise.all([refetchSchools(), refetchGrades(), refetchExams()]);
    } finally {
      event.detail.complete();
    }
  };

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

  return (
    <IonPage className="home-page">
      <IonContent className="home-content" scrollY={true}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="content-wrapper">
          {/* Header Section */}
          <div className="header-section">
            <div className="gradient-orb" />

            <div className="profile-card glass-card">
              <div className="shimmer-effect" />

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

          {/* Schools Section */}
          <div className="main-section">
            <div className="section-header">
              <h2 className="section-title">Schulen</h2>
              <div
                className="header-action-button"
                onClick={() => history.push(Routes.SETTINGS)}
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
                            <span>
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

          {/* Upcoming Exams Section */}
          <div className="main-section">
            <div className="section-header">
              <h2 className="section-title">Prüfungen</h2>
              <div
                className="header-action-button"
                onClick={() => history.push(Routes.CALENDAR)}
              >
                <IonIcon icon={calendar} className="action-icon" />
              </div>
            </div>

            <div className="exams-list">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="exam-card glass-card"
                    onClick={() =>
                      history.push(Routes.EXAM_EDIT.replace(':examId', exam.id))
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

          {/* Bottom Spacer */}
          <div className="bottom-spacer" />
        </div>

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />
      </IonContent>

      {/* Tab Bar Navigation */}
      <div className="tab-bar">
        <div className="tab-bar-content">
          <div
            className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <div className="tab-icon-wrapper">
              <IonIcon icon={homeOutline} className="tab-icon" />
            </div>
            <span className="tab-label">Home</span>
          </div>

          <div
            className={`tab-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('calendar');
              history.push(Routes.CALENDAR);
            }}
          >
            <div className="tab-icon-wrapper">
              <IonIcon icon={calendar} className="tab-icon" />
            </div>
            <span className="tab-label">Kalender</span>
          </div>

          <div className="tab-fab">
            <button
              className="tab-fab-button"
              onClick={() => setShowNavigationModal(true)}
            >
              <IonIcon icon={add} className="tab-fab-icon" />
            </button>
            <span className="tab-fab-label">Neu</span>
          </div>

          <div
            className={`tab-item ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('grades');
              history.push(Routes.GRADES_ADD);
            }}
          >
            <div className="tab-icon-wrapper">
              <IonIcon icon={trophyOutline} className="tab-icon" />
            </div>
            <span className="tab-label">Noten</span>
          </div>

          <div
            className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              history.push(Routes.SETTINGS);
            }}
          >
            <div className="tab-icon-wrapper">
              <IonIcon icon={settings} className="tab-icon" />
            </div>
            <span className="tab-label">Mehr</span>
          </div>
        </div>
      </div>
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
