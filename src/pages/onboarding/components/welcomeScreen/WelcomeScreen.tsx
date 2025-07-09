import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import {
  rocketOutline,
  trophyOutline,
  calendarOutline,
  statsChartOutline,
  heartOutline,
} from 'ionicons/icons';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-background">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
        <div className="constellation-dots">
          <div className="dot dot-1" />
          <div className="dot dot-2" />
          <div className="dot dot-3" />
          <div className="dot dot-4" />
          <div className="dot dot-5" />
        </div>
      </div>

      <div className="welcome-hero">
        <div className="hero-icon-container">
          <div className="hero-icon-wrapper">
            <IonIcon icon={rocketOutline} className="hero-icon" />
          </div>
          <div className="hero-icon-glow" />
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">NetGrade</span>
          </h1>
          <h2 className="hero-subtitle">Deine intelligente Noten-App</h2>
          <p className="hero-description">
            Organisiere deine Schulnoten, plane Prüfungen und verfolge deinen
            Fortschritt – alles an einem Ort.
          </p>
        </div>

        <div className="feature-preview">
          <div className="feature-cards">
            <div className="feature-card card-1">
              <div className="feature-icon-wrapper">
                <IonIcon icon={trophyOutline} className="feature-icon" />
              </div>
              <span>Noten verwalten</span>
            </div>
            <div className="feature-card card-2">
              <div className="feature-icon-wrapper">
                <IonIcon icon={calendarOutline} className="feature-icon" />
              </div>
              <span>Prüfungen planen</span>
            </div>
            <div className="feature-card card-3">
              <div className="feature-icon-wrapper">
                <IonIcon icon={statsChartOutline} className="feature-icon" />
              </div>
              <span>Fortschritt analysieren</span>
            </div>
          </div>
        </div>
      </div>

      <div className="welcome-actions">
        <IonButton expand="block" onClick={onNext} className="welcome-button">
          Los geht&#39;s !
        </IonButton>

        <p className="welcome-promise">
          Made with <IonIcon icon={heartOutline} />
          by Kevin, Gabriele and Arlind
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
