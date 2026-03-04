import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import {
  checkmarkCircleOutline,
  personCircleOutline,
  schoolOutline,
  bookOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { OnboardingDataTemp } from '../../types';
import './CompletionStep.css';
import '../SharedStepStyles.css';

interface CompletionStepProps {
  data: OnboardingDataTemp;
  isCompleting: boolean;
  onComplete: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({
  data,
  isCompleting,
  onComplete,
}) => {
  return (
    <div className="onboarding-step">
      <div className="step-body">
        <div className="glass-card summary-card">
          <div className="summary-content">
            <h3 className="summary-title">Zusammenfassung</h3>

            <div className="summary-item">
              <div className="summary-icon-wrapper">
                <IonIcon icon={personCircleOutline} className="summary-icon" />
              </div>
              <div className="summary-info">
                <h4>Benutzer</h4>
                <p>{data.userName}</p>
              </div>
            </div>

            <div className="summary-item">
              <div className="summary-icon-wrapper">
                <IonIcon icon={schoolOutline} className="summary-icon" />
              </div>
              <div className="summary-info">
                <h4>Schulen</h4>
                <p>
                  {data.schools.length}{' '}
                  {data.schools.length === 1 ? 'Schule' : 'Schulen'} hinzugefügt
                </p>
              </div>
            </div>

            <div className="summary-item">
              <div className="summary-icon-wrapper">
                <IonIcon icon={bookOutline} className="summary-icon" />
              </div>
              <div className="summary-info">
                <h4>Fächer</h4>
                <p>
                  {data.subjects.length}{' '}
                  {data.subjects.length === 1 ? 'Fach' : 'Fächer'} erstellt
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card features-card">
          <div className="features-content">
            <h3 className="features-title">Was du jetzt tun kannst:</h3>
            <div className="features-list">
              <div className="feature-item">
                <IonIcon icon={bookOutline} className="feature-icon-last" />
                <span>Prüfungen planen und verwalten</span>
              </div>
              <div className="feature-item">
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="feature-icon-last"
                />
                <span>Noten eintragen und verfolgen</span>
              </div>
              <div className="feature-item">
                <IonIcon
                  icon={statsChartOutline}
                  className="feature-icon-last"
                />
                <span>Fortschritte analysieren</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <div className="button-group">
          <IonButton
            expand="block"
            onClick={onComplete}
            disabled={isCompleting}
            className="primary-button"
          >
            {isCompleting ? 'Wird abgeschlossen...' : 'App starten'}
          </IonButton>
        </div>
      </div>
    </div>
  );
};

export default CompletionStep;
