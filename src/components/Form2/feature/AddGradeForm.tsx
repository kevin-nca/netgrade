import React, { useEffect, useState } from 'react';
import { IonContent, IonIcon, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { addOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { format, parseISO } from 'date-fns';
import {
  useAddGradeWithExam,
  useSchools,
  useSchoolSubjects,
} from '@/hooks/queries';
import { percentageToDecimal } from '@/utils/validation';
import { Routes } from '@/routes';
import { useAppForm } from '@/components/Form2/form';
import Header from '@/components/Header/Header';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import '@/components/Form2/feature/AddGradePage.css';
import {
  gradeFormSchema,
  type GradeFormData,
} from '@/components/Form2/feature/examFormSchemaGrade';

const AddGradeForm: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: schools = [], error: schoolsError } = useSchools();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const { data: subjects = [], error: subjectsError } =
    useSchoolSubjects(selectedSchoolId);

  const addGradeWithExamMutation = useAddGradeWithExam();

  const form = useAppForm({
    defaultValues: {
      selectedSchool: schools?.length === 1 ? schools[0] : null,
      selectedSubject: subjects?.length === 1 ? subjects[0] : null,
      examName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: '',
      score: undefined as number | undefined,
      comment: '',
    } as GradeFormData,
    validators: {
      onSubmit: gradeFormSchema,
    },
    onSubmit: async ({ value }) => {
      const scoreNumber = value.score!;
      const weightNumber = +String(value.weight).replace(',', '.');

      const gradePayload = {
        subjectId: value.selectedSubject!.id,
        examName: value.examName.trim(),
        date: parseISO(value.date),
        score: scoreNumber,
        weight: percentageToDecimal(weightNumber),
      };

      addGradeWithExamMutation.mutate(gradePayload, {
        onSuccess: () => {
          setShowSuccess(true);
          form.reset();
          setSelectedSchoolId('');
          setTimeout(() => history.push(Routes.HOME), 1200);
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

  useEffect(() => {
    if (schoolsError) {
      setToastMessage('Fehler beim Laden der Schulen');
      setToastColor('danger');
      setShowToast(true);
    }
    if (subjectsError) {
      setToastMessage('Fehler beim Laden der Fächer');
      setToastColor('danger');
      setShowToast(true);
    }
  }, [schoolsError, subjectsError]);

  const handleAddGrade = () => {
    form.handleSubmit();
  };

  return (
    <>
      <Header
        title="Note hinzufügen"
        backButton
        onBack={() => window.history.back()}
      />

      <IonContent className="add-exam-content" scrollY>
        <div className="gradient-orb" />

        {showSuccess && (
          <div className="success-overlay">
            <div className="success-content">
              <IonIcon icon={checkmarkCircleOutline} className="success-icon" />
              <h3 className="success-title">Erfolgreich hinzugefügt!</h3>
              <p className="success-message">Die Note wurde gespeichert</p>
            </div>
          </div>
        )}

        <div className="form-group">
          <div className="form-card">
            <div className="form-fields">
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

              <form.AppField name="weight">
                {(field) => <field.WeightField label="Gewichtung (0-100%)" />}
              </form.AppField>

              <form.AppField name="score">
                {(field) => <field.GradeScoreField label="Note (1-6)" />}
              </form.AppField>
            </div>
          </div>
        </div>

        <div className="button-section">
          <button
            className="glass-button primary"
            onClick={handleAddGrade}
            disabled={addGradeWithExamMutation.isPending}
          >
            <IonIcon icon={addOutline} className="button-icon" />
            <span className="button-text">
              {addGradeWithExamMutation.isPending
                ? 'Wird hinzugefügt...'
                : 'Note hinzufügen'}
            </span>
          </button>
        </div>

        <div className="bottom-spacer" />

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

export default AddGradeForm;
