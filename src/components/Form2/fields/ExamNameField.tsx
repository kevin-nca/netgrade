import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import React from 'react';
import FormFieldRow from '@/components/Form2/FormFieldRow';

export function ExamNameField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = Array.isArray(field.state.meta.errors)
    ? field.state.meta.errors
    : [];

  const firstError =
    errors.length > 0 ? String(errors[0]?.message ?? errors[0]) : undefined;

  return (
    <FormFieldRow
      icon={documentTextOutline}
      label={label}
      htmlFor="exam-title"
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
        aria-invalid={!!firstError}
        aria-describedby={firstError ? 'title-error' : undefined}
        required
        maxlength={255}
      />
    </FormFieldRow>
  );
}
