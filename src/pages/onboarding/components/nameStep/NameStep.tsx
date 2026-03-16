import React from 'react';
import { useAppForm } from '@/shared/components/form';
import { IonButton, IonIcon } from '@ionic/react';
import { personCircleOutline, arrowForward } from 'ionicons/icons';
import { OnboardingDataTemp } from '../../types';
import './NameStep.css';
import '../SharedStepStyles.css';

interface NameStepProps {
  data: OnboardingDataTemp;
  setData: React.Dispatch<React.SetStateAction<OnboardingDataTemp>>;
  onNext: () => void;
}

const NameStep: React.FC<NameStepProps> = ({ data, setData, onNext }) => {
  const form = useAppForm({
    defaultValues: {
      userName: data.userName,
    },
    onSubmit: async ({ value }) => {
      setData((prev) => ({ ...prev, userName: value.userName.trim() }));
      onNext();
    },
  });

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
            <form.AppField name="userName">
              {(field) => <field.NameField label="Dein Name" />}
            </form.AppField>

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
              onClick={() => form.handleSubmit()}
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
