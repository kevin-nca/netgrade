import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { pencilOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/components/Form2/form-field/FormInput';

export function AddSchoolField({ label }: { label: string }) {
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
      htmlFor="school-name"
      required
      error={firstError}
      errorId="school-name-error"
    >
      <IonInput
        id="school-name"
        className="form-input"
        type="text"
        value={field.state.value}
        onIonChange={(e) => {
          const val = e.detail.value ?? '';
          field.handleChange(val);
        }}
        placeholder="Name der Schule..."
        required
        maxlength={255}
      />
    </FormInput>
  );
}
