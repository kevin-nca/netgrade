import React from 'react';
import { addOutline } from 'ionicons/icons';
import { useAppForm } from '@/shared/components/form';
import {
  schoolFormSchema,
  type SchoolFormData,
} from './schema/add-school-form-schema';
import ModalSubmitButton from '@/shared/components/buttons/submitt-button/modal-submit-button';
import ModalCancelButton from '@/shared/components/buttons/cancel-button/modal-cancel-button';
import ModalButtonGroup from '@/shared/components/buttons/modal-button-group';

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

      <ModalButtonGroup>
        <ModalCancelButton
          onClick={onCancel}
          disabled={isLoading}
          text="Abbrechen"
        />
        <form.Subscribe selector={(state) => [state.values.schoolName]}>
          {([schoolName]) => (
            <ModalSubmitButton
              onClick={handleAdd}
              disabled={!schoolName.trim() || isLoading}
              isLoading={isLoading}
              loadingText="Speichert..."
              text="Hinzufügen"
              icon={addOutline}
            />
          )}
        </form.Subscribe>
      </ModalButtonGroup>
    </>
  );
};
