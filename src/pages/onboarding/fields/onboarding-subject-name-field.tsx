import { useFieldContext } from '@/shared/components/form';
import { IonIcon, IonInput, IonItem } from '@ionic/react';
import { bookOutline } from 'ionicons/icons';
import React from 'react';

export function OnboardingSubjectNameField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="input-wrapper glass-input">
        <IonItem lines="none" className="input-item">
          <div slot="start" className="input-icon-wrapper">
            <IonIcon icon={bookOutline} className="input-icon" />
          </div>
          <IonInput
            className="input-field"
            type="text"
            value={field.state.value}
            onIonChange={(e) => field.handleChange(e.detail.value ?? '')}
            placeholder="Neues Fach hinzufügen"
            clearInput
          />
        </IonItem>
      </div>
    </div>
  );
}
