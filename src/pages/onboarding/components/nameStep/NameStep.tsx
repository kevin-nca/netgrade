import React, { useState } from 'react';
import { IonButton, IonIcon, IonInput, IonItem } from '@ionic/react';
import {
  personCircleOutline,
  createOutline,
  arrowForward,
} from 'ionicons/icons';
import { OnboardingDataTemp } from '../../types';
import './NameStep.css';

interface NameStepProps {
  data: OnboardingDataTemp;
  setData: React.Dispatch<React.SetStateAction<OnboardingDataTemp>>;
  onNext: () => void;
}

const NameStep: React.FC<NameStepProps> = ({ data, setData, onNext }) => {
  const [localName, setLocalName] = useState(data.userName);

  const handleNext = () => {
    if (localName.trim()) {
      setData((prev) => ({ ...prev, userName: localName.trim() }));
      onNext();
    }
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <div className="gradient-orb" />
        <div className="step-content">
          <div className="step-icon-wrapper">
            <IonIcon icon={personCircleOutline} className="step-icon" />
          </div>
          <div className="step-text">
            <h1 className="step-title">Schön, dich kennenzulernen!</h1>
            <p className="step-subtitle">Wie sollen wir dich nennen?</p>
          </div>
        </div>
      </div>

      <div className="step-body">
        <div className="glass-card input-card">
          <div className="input-section">
            <div className="input-wrapper glass-input">
              <IonItem lines="none" className="input-item">
                <div slot="start" className="input-icon-wrapper">
                  <IonIcon icon={createOutline} className="input-icon" />
                </div>
                <IonInput
                  value={localName}
                  placeholder="Dein Vorname..."
                  onIonChange={(e) => setLocalName(e.detail.value || '')}
                  className="input-field"
                  clearInput
                  autoFocus
                  maxlength={32}
                />
              </IonItem>
            </div>

            <div className="input-hint">
              <p>Keine Sorge, nur du siehst diese Information.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <IonButton
          expand="block"
          onClick={handleNext}
          disabled={!localName.trim()}
          className="primary-button"
        >
          Weiter
          <IonIcon slot="end" icon={arrowForward} />
        </IonButton>
      </div>
    </div>
  );
};

export default NameStep;
