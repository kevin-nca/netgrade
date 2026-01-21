import { useFieldContext } from '@/shared/Form/ui/form';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { libraryOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/Form/ui/form-field/FormInput';
import { Subject } from '@/db/entities';

interface SubjectSelectFieldProps {
  label: string;
  subjects: Subject[];
  disabled?: boolean;
  placeholder?: string;
}

export function SubjectSelectField({
  label,
  subjects,
  disabled = false,
  placeholder = 'Fach auswählen',
}: SubjectSelectFieldProps) {
  const field = useFieldContext<Subject | null>();

  const errors = field.state.meta.errors;

  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={libraryOutline}
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
        placeholder={placeholder}
        value={field.state.value?.id ?? ''}
        onIonChange={(e) => {
          const selectedId = e.detail.value;
          const selectedSubject = subjects.find((s) => s.id === selectedId);
          if (selectedSubject) {
            field.handleChange(selectedSubject);
          }
        }}
        disabled={disabled}
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
