import { useFieldContext } from '@/shared/components/form';
import { IonInput } from '@ionic/react';
import { pencilOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/components/form-field/form-input';

export function AddSemesterNameField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;

  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={pencilOutline}
      label={label}
      htmlFor="semester-name"
      required
      error={firstError}
      errorId="semester-name-error"
    >
      <IonInput
        id="semester-name"
        className="form-input"
        type="text"
        value={field.state.value}
        onIonChange={(e) => {
          const val = e.detail.value ?? '';
          field.handleChange(val);
        }}
        placeholder="Name des Semesters..."
        required
        maxlength={255}
      />
    </FormInput>
  );
}
