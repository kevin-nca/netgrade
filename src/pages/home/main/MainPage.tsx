import React, { useState } from 'react';
import {
  IonContent,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonRouter,
} from '@ionic/react';
import { add, personCircleOutline } from 'ionicons/icons';
import { useAddSchool, useUserName } from '@/hooks/queries';
import { Routes } from '@/routes';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import AddSchoolModal from '@/components/modals/AddSchoolModal';
import ExamsList from '@/pages/home/main/components/ExamsList';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import SchoolsList from '@/pages/home/main/components/SchoolsList';

import './MainPage.css';

function MainPage() {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const router = useIonRouter();

  const { data: userName } = useUserName();

  const addSchoolMutation = useAddSchool();

  const handleAddSchool = (schoolName: string) => {
    if (schoolName.trim()) {
      addSchoolMutation.mutate(
        { name: schoolName.trim() },
        {
          onSuccess: () => {
            setShowAddSchoolModal(false);
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
                  onClick={() => router.push(Routes.SETTINGS, 'forward')}
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
                onClick={() => router.push(Routes.EXAMS_ADD, 'forward')}
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
        onClose={() => setShowAddSchoolModal(false)}
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

export default MainPage;
