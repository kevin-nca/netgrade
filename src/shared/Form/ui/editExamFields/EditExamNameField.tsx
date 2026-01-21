import React from 'react';

import { documentTextOutline } from 'ionicons/icons';
import { useFieldContext } from '@/shared/Form/ui/form';
import FormInput from '@/shared/Form/ui/form-field/FormInput';
import { IonInput } from '@ionic/react';

export function EditExamNameField({ label }: { label: string }) {
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
      icon={documentTextOutline}
      label={label}
      htmlFor="exam-name"
      required
      error={firstError}
      errorId="title-error"
    >
      <IonInput
        id="exam-title"
        className="form-input"
        type="text"
        value={field.state.value}
        onIonChange={(e) => {
          const val = e.detail.value ?? '';
          field.handleChange(val);
        }}
        placeholder="z.B. Mathe-Klausur, Vokabeltest"
        required
        maxlength={255}
      />
    </FormInput>
  );
}
