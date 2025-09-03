import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  setShowNavigationModal,
}) => {
  const history = useHistory();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  // Update activeTab based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === Routes.HOME) {
      setActiveTab('home');
    } else if (currentPath === Routes.CALENDAR) {
      setActiveTab('calendar');
    } else if (currentPath === Routes.GRADES_ADD) {
      setActiveTab('grades');
    } else if (currentPath === Routes.SETTINGS) {
      setActiveTab('settings');
    }
  }, [location.pathname]);

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
    </>
  );
};

export default BottomNavigation;
