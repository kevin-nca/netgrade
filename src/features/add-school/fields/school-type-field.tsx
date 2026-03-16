import { useFieldContext } from '@/shared/components/form';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { businessOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/components/form-field/form-input';
import { SCHOOL_TYPES } from '@/pages/onboarding/types';

export function SchoolTypeField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;
  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={businessOutline}
      label={label}
      htmlFor="school-type"
      error={firstError}
      errorId="school-type-error"
    >
      <IonSelect
        id="school-type"
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
    </FormInput>
  );
}
