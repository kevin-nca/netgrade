import { useFieldContext } from '@/shared/components/form';
import { IonInput } from '@ionic/react';
import { personOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/components/form-field/form-input';

export function TeacherField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;
  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={personOutline}
      label={label}
      htmlFor="teacher"
      error={firstError}
      errorId="teacher-error"
    >
      <IonInput
        id="teacher"
        className="form-input"
        type="text"
        value={field.state.value}
        onIonChange={(e) => field.handleChange(e.detail.value ?? '')}
        placeholder="z.B. Frau Schmidt"
        clearInput
      />
    </FormInput>
  );
}
