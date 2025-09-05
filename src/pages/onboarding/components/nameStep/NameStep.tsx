import React from 'react';
import { useForm } from '@tanstack/react-form';
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
  const form = useForm({
    defaultValues: {
      userName: data.userName,
    },
    onSubmit: async ({ value }) => {
      setData((prev) => ({ ...prev, userName: value.userName.trim() }));
      onNext();
    },
  });

  const handleNext = () => {
    form.handleSubmit();
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
            <form.Field name="userName">
              {(field) => (
                <div className="input-wrapper glass-input">
                  <IonItem lines="none" className="input-item">
                    <div slot="start" className="input-icon-wrapper">
                      <IonIcon icon={createOutline} className="input-icon" />
                    </div>
                    <IonInput
                      value={field.state.value}
                      placeholder="Dein Vorname..."
                      onIonInput={(e) =>
                        field.handleChange(e.detail.value || '')
                      }
                      className="input-field"
                      clearInput
                      autoFocus
                      maxlength={32}
                    />
                  </IonItem>
                </div>
              )}
            </form.Field>

            <div className="input-hint">
              <p>Keine Sorge, nur du siehst diese Information.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <form.Subscribe selector={(state) => [state.values.userName]}>
          {([userName]) => (
            <IonButton
              expand="block"
              onClick={handleNext}
              disabled={!userName.trim()}
              className="primary-button"
            >
              Weiter
              <IonIcon slot="end" icon={arrowForward} />
            </IonButton>
          )}
        </form.Subscribe>
      </div>
    </div>
  );
};

export default NameStep;
