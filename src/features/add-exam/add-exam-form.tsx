import React, { useState } from 'react';
import { IonContent, IonToast } from '@ionic/react';
import { format } from 'date-fns';
import { useAddExam, useSchools, useSchoolSubjects } from '@/hooks';
import { useAppForm } from '@/shared/components/form';
import Header from '@/components/Header/Header';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import SubmitButton from '@/shared/components/buttons/submitt-button/submit-button';
import FormContainer from '@/shared/components/form-layout/form-container';
import SuccessOverlay from '@/shared/components/form-layout/succes-overlay';
import {
  examFormSchema,
  type ExamFormData,
} from './schema/exam-form-schema-exam';

interface AddExamFormProps {
  onSuccess?: () => void;
}

const AddExamForm: React.FC<AddExamFormProps> = ({ onSuccess }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: schools = [], error: schoolsError } = useSchools();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const { data: subjects = [], error: subjectsError } =
    useSchoolSubjects(selectedSchoolId);

  const addExamMutation = useAddExam();

  const form = useAppForm({
    defaultValues: {
      selectedSchool: null,
      selectedSubject: null,
      examName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    } as ExamFormData,
    validators: {
      onSubmit: examFormSchema,
    },
    onSubmit: async ({ value }) => {
      const examPayload = {
        schoolId: value.selectedSchool!.id,
        subjectId: value.selectedSubject!.id,
        title: value.examName.trim(),
        date: new Date(value.date + 'T12:00:00'),
        description: value.description.trim(),
      };

      addExamMutation.mutate(examPayload, {
        onSuccess: () => {
          setShowSuccess(true);
          form.reset();
          setSelectedSchoolId('');
          setTimeout(() => {
            onSuccess?.();
          }, 1200);
        },
        onError: (error) => {
          setToastMessage(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          );
          setToastColor('danger');
          setShowToast(true);
        },
      });
    },
  });

  if (schoolsError && !showToast) {
    setToastMessage('Fehler beim Laden der Schulen');
    setToastColor('danger');
    setShowToast(true);
  }

  if (subjectsError && !showToast) {
    setToastMessage('Fehler beim Laden der Fächer');
    setToastColor('danger');
    setShowToast(true);
  }

  const handleAddExam = () => {
    form.handleSubmit();
  };

  return (
    <>
      <Header
        title="Prüfung hinzufügen"
        backButton
        onBack={() => window.history.back()}
      />

      <IonContent className="add-exam-content" scrollY>
        <SuccessOverlay
          show={showSuccess}
          title="Erfolgreich hinzugefügt!"
          message="Die Prüfung wurde gespeichert"
        />

        <FormContainer>
          <form.AppField name="selectedSchool">
            {(field) => (
              <field.SchoolSelectField
                label="Schule"
                schools={schools ?? []}
                onSchoolChange={(schoolId: string) => {
                  setSelectedSchoolId(schoolId);
                  form.setFieldValue('selectedSubject', null);
                }}
              />
            )}
          </form.AppField>

          <form.AppField name="selectedSubject">
            {(field) => (
              <field.SubjectSelectField
                label="Fach"
                subjects={subjects ?? []}
                disabled={!selectedSchoolId || subjects.length === 0}
                placeholder={
                  selectedSchoolId
                    ? 'Fach auswählen'
                    : 'Bitte zuerst eine Schule auswählen'
                }
              />
            )}
          </form.AppField>

          <form.AppField name="examName">
            {(field) => <field.ExamNameField label="Prüfungsname" />}
          </form.AppField>

          <form.AppField name="date">
            {(field) => <field.DateField label="Datum" />}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.DescriptionField label="Beschreibung (optional)" />
            )}
          </form.AppField>
        </FormContainer>

        <SubmitButton
          onClick={handleAddExam}
          isLoading={addExamMutation.isPending}
          loadingText="Wird hinzugefügt..."
          text="Prüfung hinzufügen"
        />

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={toastColor === 'success' ? 3000 : 2000}
          color={toastColor}
        />
      </IonContent>

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </>
  );
};

export default AddExamForm;
