import React from 'react';
import { IonButton } from '@ionic/react';
import { useAppForm } from '@/shared/Form/ui/form';
import {
  schoolFormSchema,
  type SchoolFormData,
} from '@/features/Form/add-school/schema/addSchoolFormSchema';

interface AddSchoolFormProps {
  onSubmit: (schoolName: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const AddSchoolForm: React.FC<AddSchoolFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const form = useAppForm({
    defaultValues: {
      schoolName: '',
    } as SchoolFormData,
    validators: {
      onSubmit: schoolFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value.schoolName.trim());
    },
  });

  const handleAdd = () => {
    form.handleSubmit();
  };

  return (
    <>
      <div className="form-fields">
        <form.AppField name="schoolName">
          {(field) => <field.AddSchoolField label="Schulname" />}
        </form.AppField>
      </div>

      <div className="modal-button-section">
        <div className="modal-buttons">
          <IonButton
            onClick={onCancel}
            fill="clear"
            disabled={isLoading}
            expand="block"
          >
            Abbrechen
          </IonButton>
          <IonButton
            onClick={handleAdd}
            disabled={isLoading}
            expand="block"
            color="primary"
          >
            {isLoading ? 'Speichert...' : 'Hinzufügen'}
          </IonButton>
        </div>
      </div>
    </>
  );
};
