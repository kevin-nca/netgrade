import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { add, personCircleOutline } from 'ionicons/icons';
import { useAddSchool, useUsername } from '@/hooks/queries';
import { Routes } from '@/routes';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import AddSchoolModal from '@/components/modals/AddSchoolModal';
import ExamsList from '@/pages/home/components/ExamsList';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import SchoolsList from '@/pages/home/components/SchoolsList';

import './HomePage.css';

function HomePage() {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [schoolNameInput, setSchoolNameInput] = useState('');
  const history = useHistory();

  const { data: userName } = useUsername();

  const addSchoolMutation = useAddSchool();

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

            <SchoolsList />
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

            <ExamsList />
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
