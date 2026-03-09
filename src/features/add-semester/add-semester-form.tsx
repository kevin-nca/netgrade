import React from 'react';
import { addOutline } from 'ionicons/icons';
import { useAppForm } from '@/shared/components/form';
import {
  semesterFormSchema,
  type SemesterFormData,
} from './schema/add-semester-form-schema';
import ModalSubmitButton from '@/shared/components/buttons/submitt-button/modal-submit-button';
import ModalCancelButton from '@/shared/components/buttons/cancel-button/modal-cancel-button';
import ModalButtonGroup from '@/shared/components/buttons/modal-button-group';
import { School } from '@/db/entities';

export interface AddSemesterPayload {
  name: string;
  startDate: Date;
  endDate: Date;
  schoolId: string;
}

interface AddSemesterFormProps {
  onSubmit: (payload: AddSemesterPayload) => void;
  onCancel: () => void;
  isLoading: boolean;
  schools: School[];
}

export const AddSemesterForm: React.FC<AddSemesterFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  schools,
}) => {
  const form = useAppForm({
    defaultValues: {
      semesterName: '',
      startDate: '',
      endDate: '',
      schoolId: '',
    } as SemesterFormData,
    validators: {
      onSubmit: semesterFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.semesterName.trim(),
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
        schoolId: value.schoolId,
      });
    },
  });

  const handleAdd = () => {
    form.handleSubmit();
  };

  return (
    <>
      <div className="form-fields">
        <form.AppField name="semesterName">
          {(field) => <field.AddSemesterNameField label="Semestername" />}
        </form.AppField>

        <form.AppField name="schoolId">
          {(field) => (
            <field.SemesterSchoolSelectField label="Schule" schools={schools} />
          )}
        </form.AppField>

        <form.AppField name="startDate">
          {(field) => <field.DateField label="Startdatum" />}
        </form.AppField>

        <form.AppField name="endDate">
          {(field) => <field.DateField label="Enddatum" />}
        </form.AppField>
      </div>

      <ModalButtonGroup>
        <ModalCancelButton
          onClick={onCancel}
          disabled={isLoading}
          text="Abbrechen"
        />
        <form.Subscribe
          selector={(state) => [
            state.values.semesterName,
            state.values.startDate,
            state.values.endDate,
            state.values.schoolId,
          ]}
        >
          {([semesterName, startDate, endDate, schoolId]) => (
            <ModalSubmitButton
              onClick={handleAdd}
              disabled={
                !semesterName.trim() ||
                !startDate ||
                !endDate ||
                !schoolId ||
                isLoading
              }
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
