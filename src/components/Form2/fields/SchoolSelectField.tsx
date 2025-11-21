import { useFieldContext } from '@/components/Form2/form';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { schoolOutline } from 'ionicons/icons';
import React from 'react';
import FormFieldRow from '@/components/Form2/FormFieldRow';
import { School } from '@/db/entities';

interface SchoolSelectFieldProps {
  label: string;
  schools: School[];
  onSchoolChange: (schoolId: string) => void;
}

export function SchoolSelectField({
  label,
  schools,
  onSchoolChange,
}: SchoolSelectFieldProps) {
  const field = useFieldContext<string>();

  const errors = Array.isArray(field.state.meta.errors)
    ? field.state.meta.errors
    : [];

  const firstError =
    errors.length > 0 ? String(errors[0]?.message ?? errors[0]) : undefined;

  return (
    <FormFieldRow
      icon={schoolOutline}
      label={label}
      htmlFor="school-select"
      required
      error={firstError}
      errorId="school-error"
    >
      <IonSelect
        id="school-select"
        className="form-input"
        interface="popover"
        placeholder="Schule auswählen"
        value={field.state.value}
        onIonChange={(e) => {
          const val = String(e.detail.value);
          field.handleChange(val);
          onSchoolChange(val);
        }}
        aria-invalid={!!firstError}
        aria-describedby={firstError ? 'school-error' : undefined}
      >
        {schools.map((school) => (
          <IonSelectOption key={school.id} value={school.id}>
            {school.name}
          </IonSelectOption>
        ))}
      </IonSelect>
    </FormFieldRow>
  );
}
