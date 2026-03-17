import { useFieldContext } from '@/shared/components/form';
import { IonInput } from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/components/form-field/form-input';

export function NameField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;
  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={createOutline}
      label={label}
      htmlFor="name"
      error={firstError}
      errorId="name-error"
    >
      <IonInput
        id="name"
        className="form-input"
        type="text"
        value={field.state.value}
        onIonChange={(e) => field.handleChange(e.detail.value ?? '')}
        clearInput
      />
    </FormInput>
  );
}
