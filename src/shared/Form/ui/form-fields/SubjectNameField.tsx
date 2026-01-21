import { useFieldContext } from '@/shared/Form/ui/form';
import { IonInput } from '@ionic/react';
import { bookOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/Form/ui/form-field/FormInput';

export function SubjectNameField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;

  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={bookOutline}
      label={label}
      htmlFor="subject-name"
      required
      error={firstError}
      errorId="subject-name-error"
    >
      <IonInput
        id="subject-name"
        className="form-input"
        type="text"
        value={field.state.value}
        onIonChange={(e) => {
          const val = e.detail.value ?? '';
          field.handleChange(val);
        }}
        placeholder="Neues Fach hinzufügen"
        required
        maxlength={255}
      />
    </FormInput>
  );
}
