import { useFieldContext } from '@/shared/components/form';
import { IonIcon, IonItem, IonSelect, IonSelectOption } from '@ionic/react';
import { businessOutline } from 'ionicons/icons';
import React from 'react';
import { SCHOOL_TYPES } from '@/pages/onboarding/types';

export function OnboardingSchoolTypeField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="input-wrapper glass-input">
        <IonItem lines="none" className="input-item">
          <div slot="start" className="input-icon-wrapper">
            <IonIcon icon={businessOutline} className="input-icon" />
          </div>
          <IonSelect
            value={field.state.value}
            placeholder="Wähle den Schultyp"
            onIonChange={(e) => field.handleChange(e.detail.value ?? '')}
            interface="popover"
          >
            {SCHOOL_TYPES.map((type) => (
              <IonSelectOption key={type} value={type}>
                {type}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </div>
    </div>
  );
}
