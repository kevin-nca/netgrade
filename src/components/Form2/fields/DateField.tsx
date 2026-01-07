import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/components/Form2/form-field/FormInput';

export function DateField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = Array.isArray(field.state.meta.errors)
    ? field.state.meta.errors
    : [];

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
        aria-invalid={!!firstError}
        aria-describedby={firstError ? 'date-error' : undefined}
        required
      />
    </FormInput>
  );
}
