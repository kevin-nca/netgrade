import { useFieldContext } from '@/components/Form2/form';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { schoolOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/components/Form2/form-field/FormInput';
import { Subject } from '@/db/entities';

interface EditExamSubjectSelectFieldProps {
  label: string;
  subjects: Subject[];
}

export function EditExamSubjectSelectField({
  label,
  subjects,
}: EditExamSubjectSelectFieldProps) {
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
      icon={schoolOutline}
      label={label}
      htmlFor="subject-select"
      required
      error={firstError}
      errorId="subject-error"
    >
      <IonSelect
        id="subject-select"
        className="form-input"
        interface="popover"
        placeholder="Fach auswählen"
        value={field.state.value}
        onIonChange={(e) => {
          const selectedId = e.detail.value;
          field.handleChange(selectedId);
        }}
      >
        {subjects.map((subject) => (
          <IonSelectOption key={subject.id} value={subject.id}>
            {subject.name}
          </IonSelectOption>
        ))}
      </IonSelect>
    </FormInput>
  );
}
