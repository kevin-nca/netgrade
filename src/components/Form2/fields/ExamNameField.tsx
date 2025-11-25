import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/components/Form2/form-field/FormInput';

export function ExamNameField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  return (
    <FormInput
      icon={documentTextOutline}
      label={label}
      htmlFor="exam-title"
      required
      errors={field.state.meta.errors}
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
        aria-invalid={!!field.state.meta.errors}
        aria-describedby={field.state.meta.errors ? 'title-error' : undefined}
        required
        maxlength={255}
      />
    </FormInput>
  );
}
