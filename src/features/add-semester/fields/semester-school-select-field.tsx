import { useFieldContext } from '@/shared/components/form';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { schoolOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/components/form-field/form-input';
import { School } from '@/db/entities';

interface SemesterSchoolSelectFieldProps {
  label: string;
  schools: School[];
}

export function SemesterSchoolSelectField({
  label,
  schools,
}: SemesterSchoolSelectFieldProps) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;

  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={schoolOutline}
      label={label}
      htmlFor="semester-school-select"
      required
      error={firstError}
      errorId="semester-school-error"
    >
      <IonSelect
        id="semester-school-select"
        className="form-input"
        interface="popover"
        placeholder="Schule auswählen"
        value={field.state.value}
        onIonChange={(e) => {
          field.handleChange(e.detail.value ?? '');
        }}
      >
        {schools.map((school) => (
          <IonSelectOption key={school.id} value={school.id}>
            {school.name}
          </IonSelectOption>
        ))}
      </IonSelect>
    </FormInput>
  );
}
