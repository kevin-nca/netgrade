import { useFieldContext } from '@/shared/Form/ui/form';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { schoolOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/Form/ui/form-field/FormInput';
import { School } from '@/db/entities';

interface SchoolSelectFieldProps {
  label: string;
  schools: School[];
  onSchoolChange?: (schoolId: string) => void;
}

export function SchoolSelectField({
  label,
  schools,
  onSchoolChange,
}: SchoolSelectFieldProps) {
  const field = useFieldContext<School | null>();

  const errors = field.state.meta.errors;

  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
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
        value={field.state.value?.id ?? ''}
        onIonChange={(e) => {
          const selectedId = e.detail.value;
          const selectedSchool = schools.find((s) => s.id === selectedId);
          if (selectedSchool) {
            field.handleChange(selectedSchool);
            onSchoolChange?.(selectedId);
          }
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
