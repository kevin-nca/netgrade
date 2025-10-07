import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/react';
import {
  add,
  school,
  chevronForwardOutline,
  statsChartOutline,
  personCircleOutline,
} from 'ionicons/icons';
import {
  useAddSchool,
  useSchoolCompleted,
  useGradeCompleted,
  useUsername,
  useExamsCompleted,
} from '@/hooks/queries';
import { Routes } from '@/routes';
import { Grade } from '@/db/entities';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import AddSchoolModal from '@/components/modals/AddSchoolModal';
import ExamsList from '@/components/homePage/ExamsList';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';

function HomePage() {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [schoolNameInput, setSchoolNameInput] = useState('');
  const history = useHistory();

  const { data: schools, isLoading } = useSchoolCompleted();
  const { data: grades } = useGradeCompleted();
  const { data: userName } = useUsername();
  const { data: upcomingExams, isLoading: isLoadingExams } = useExamsCompleted();
  const addSchoolMutation = useAddSchool();

  // Should be implemented in service
  const calculateSchoolAverage = (schoolId: string, grades: Grade[] | undefined) => {
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

  const handleAddSchool = () => {
    if (schoolNameInput.trim()) {
      addSchoolMutation.mutate(
        { name: schoolNameInput.trim() },
        {
          onSuccess: () => {
            setShowAddSchoolModal(false);
            setSchoolNameInput('');
          },
          onError: (error) => {
            console.error('Error when adding:', error);
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
        <IonRefresher slot="fixed">
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
              {isLoading ? (
                  <IonSpinner name="crescent" />
              ) : schools && schools.length > 0 ? (
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

            <ExamsList upcomingExams={upcomingExams} isLoading={isLoadingExams} />
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
