import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/components/Form2/form-field/FormInput';

export function DescriptionField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = Array.isArray(field.state.meta.errors)
    ? field.state.meta.errors
    : [];

  const firstError =
    errors.length > 0 ? String(errors[0]?.message ?? errors[0]) : undefined;

  return (
    <FormInput
      icon={documentTextOutline}
      label={label}
      htmlFor="exam-description"
      error={firstError}
      errorId="description-error"
    >
      <IonInput
        id="exam-description"
        className="form-input"
        type="text"
        value={field.state.value}
        onIonChange={(e) => {
          const val = e.detail.value ?? '';
          field.handleChange(val);
        }}
        placeholder="Zusätzliche Notizen..."
        aria-invalid={!!firstError}
        aria-describedby={firstError ? 'description-error' : undefined}
      />
    </FormInput>
  );
}
