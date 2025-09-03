import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  calendar,
  add,
  homeOutline,
  trophyOutline,
  settings,
} from 'ionicons/icons';
import { Routes } from '@/routes';

interface BottomNavigationProps {
  showNavigationModal: boolean;
  setShowNavigationModal: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  showNavigationModal,
  setShowNavigationModal,
  activeTab,
  setActiveTab,
}) => {
  const history = useHistory();

  return (
    <>
      <div className="bottom-spacer" />

      {/* Tab Bar */}
      <div className="tab-bar">
        <div className="tab-bar-content">
          <div
            className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('home');
              history.push(Routes.HOME);
            }}
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
              history.push(Routes.CALENDAR); // ← Jetzt mit Navigation!
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
    </>
  );
};

export default BottomNavigation;
