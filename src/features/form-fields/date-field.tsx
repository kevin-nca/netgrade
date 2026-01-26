import { useFieldContext } from '@/shared/components/form';
import { IonInput } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/components/form-field/form-input';

export function DateField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;

  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={calendarOutline}
      label={label}
      htmlFor="exam-date"
      required
      error={firstError}
      errorId="date-error"
    >
      <IonInput
        id="exam-date"
        className="form-input"
        type="date"
        value={field.state.value}
        onIonChange={(e) => {
          const val = e.detail.value ?? '';
          field.handleChange(val);
        }}
        required
      />
    </FormInput>
  );
}
