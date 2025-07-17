import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import {
  schoolOutline,
  bookOutline,
  documentTextOutline,
  calendarOutline,
  trophyOutline,
  scaleOutline,
  chatbubbleOutline,
  saveOutline,
} from 'ionicons/icons';
import {
  GlassForm,
  GlassFormSection,
  GlassInput,
  GlassSelect,
  GlassDatePicker,
  GlassTextarea,
  GlassButton,
} from '@/components/GlassForm';
import Header from '@/components/Header/Header';
import { School, Subject } from '@/db/entities';
import { format, parseISO } from 'date-fns';
import {
  useSchools,
  useSchoolSubjects,
  useAddGradeWithExam,
} from '@/hooks/queries';
import {
  validateGrade,
  validateWeight,
  percentageToDecimal,
} from '@/utils/validation';
import { Routes } from '@/routes';

interface GradeAddFormData {
  selectedSchoolId: string;
  selectedSubjectId: string;
  examName: string;
  date: string;
  weight: number;
  score: number;
  comment: string;
}

interface FormErrors {
  selectedSchoolId?: string;
  selectedSubjectId?: string;
  examName?: string;
  date?: string;
  weight?: string;
  score?: string;
}

const AddGradePage: React.FC = () => {
  const history = useHistory();
  const { schoolId: routeSchoolId } = useParams<{ schoolId: string }>();

  const [formData, setFormData] = useState<GradeAddFormData>({
    selectedSchoolId: routeSchoolId || '',
    selectedSubjectId: '',
    examName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: 100,
    score: 0,
    comment: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { data: schools = [], error: schoolsError } = useSchools();
  const { data: subjects = [], error: subjectsError } = useSchoolSubjects(
    formData.selectedSchoolId,
  );

  const addGradeWithExamMutation = useAddGradeWithExam();

  // Show error messages if fetching fails
  useEffect(() => {
    if (schoolsError) {
      showAndSetToastMessage('Failed to fetch schools');
    }
    if (subjectsError) {
      showAndSetToastMessage('Failed to fetch subjects');
    }
  }, [schoolsError, subjectsError]);

  // Update selectedSchoolId if routeSchoolId changes and is valid
  useEffect(() => {
    if (routeSchoolId && routeSchoolId !== formData.selectedSchoolId) {
      setFormData((prev) => ({
        ...prev,
        selectedSchoolId: routeSchoolId,
        selectedSubjectId: '',
      }));
    }
  }, [routeSchoolId, formData.selectedSchoolId]);

  const handleFieldChange = <K extends keyof GradeAddFormData>(
    field: K,
    value: GradeAddFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user changes field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Reset subject when school changes
    if (field === 'selectedSchoolId') {
      setFormData((prev) => ({ ...prev, selectedSubjectId: '' }));
    }
  };

  const showAndSetToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.selectedSubjectId) {
      newErrors.selectedSubjectId = 'Bitte wähle ein Fach aus!';
    }
    if (!formData.examName.trim()) {
      newErrors.examName = 'Bitte gib einen Prüfungsnamen ein!';
    }

    const gradeError = validateGrade(formData.score);
    if (gradeError) {
      newErrors.score = gradeError;
    }

    const weightError = validateWeight(formData.weight);
    if (weightError) {
      newErrors.weight = weightError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGrade = () => {
    if (!validateForm()) return;

    const gradePayload = {
      subjectId: formData.selectedSubjectId,
      examName: formData.examName.trim(),
      date: parseISO(formData.date),
      score: formData.score,
      weight: percentageToDecimal(formData.weight),
      comment: formData.comment.trim() || undefined,
    };

    addGradeWithExamMutation.mutate(gradePayload, {
      onSuccess: () => {
        setFormData({
          selectedSchoolId: routeSchoolId || '',
          selectedSubjectId: '',
          examName: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          weight: 100,
          score: 0,
          comment: '',
        });
        history.push(Routes.HOME);
        showAndSetToastMessage('Note erfolgreich hinzugefügt.');
      },
      onError: (error) => {
        showAndSetToastMessage(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        );
      },
    });
  };

  // Convert data to select options
  const schoolOptions = schools.map((school: School) => ({
    value: school.id,
    label: school.name,
  }));

  const subjectOptions = subjects.map((subject: Subject) => ({
    value: subject.id,
    label: subject.name,
  }));

  return (
    <IonPage>
      <Header
        title="Note hinzufügen"
        backButton={true}
        defaultHref={Routes.HOME}
      />
      <IonContent fullscreen>
        <div style={{ padding: '20px' }}>
          <GlassForm onSubmit={handleAddGrade}>
            {/* School & Subject Selection */}
            <GlassFormSection
              title="Schule & Fach"
              subtitle="Wähle die entsprechende Zuordnung"
              icon={schoolOutline}
            >
              <GlassSelect
                label="Schule"
                value={formData.selectedSchoolId}
                onChange={(value) =>
                  handleFieldChange('selectedSchoolId', String(value))
                }
                options={schoolOptions}
                placeholder="Wähle eine Schule"
                icon={schoolOutline}
                required
                error={errors.selectedSchoolId}
              />

              <GlassSelect
                label="Fach"
                value={formData.selectedSubjectId}
                onChange={(value) =>
                  handleFieldChange('selectedSubjectId', String(value))
                }
                options={subjectOptions}
                placeholder={
                  !formData.selectedSchoolId || subjects.length === 0
                    ? 'Bitte zuerst Schule wählen'
                    : 'Wähle ein Fach'
                }
                icon={bookOutline}
                required
                error={errors.selectedSubjectId}
                disabled={!formData.selectedSchoolId || subjects.length === 0}
              />
            </GlassFormSection>

            {/* Exam Details */}
            <GlassFormSection
              title="Prüfungsdetails"
              subtitle="Informationen zur Prüfung"
              icon={documentTextOutline}
            >
              <GlassInput
                label="Prüfungsname"
                value={formData.examName}
                onChange={(value) =>
                  handleFieldChange('examName', String(value))
                }
                placeholder="z.B. Klausur 1, Vokabeltest"
                icon={documentTextOutline}
                required
                error={errors.examName}
                clearable
              />

              <GlassDatePicker
                label="Datum"
                value={formData.date}
                onChange={(value) => handleFieldChange('date', String(value))}
                icon={calendarOutline}
                required
                error={errors.date}
              />
            </GlassFormSection>

            {/* Grade Details */}
            <GlassFormSection
              title="Bewertung"
              subtitle="Note und Gewichtung eingeben"
              icon={trophyOutline}
            >
              <GlassInput
                label="Note (1 bis 6)"
                value={formData.score}
                onChange={(value) => handleFieldChange('score', Number(value))}
                variant="number"
                icon={trophyOutline}
                required
                error={errors.score}
                min={1}
                max={6}
                step={0.1}
              />

              <GlassInput
                label="Gewichtung (0 bis 100%)"
                value={formData.weight}
                onChange={(value) => handleFieldChange('weight', Number(value))}
                variant="number"
                icon={scaleOutline}
                required
                error={errors.weight}
                min={0}
                max={100}
                step={1}
              />

              <GlassTextarea
                label="Kommentar (optional)"
                value={formData.comment}
                onChange={(value) => handleFieldChange('comment', value)}
                placeholder="Zusätzliche Notizen..."
                icon={chatbubbleOutline}
                maxLength={500}
                autoGrow
              />
            </GlassFormSection>

            {/* Submit Button */}
            <GlassButton
              variant="primary"
              onClick={handleAddGrade}
              loading={addGradeWithExamMutation.isPending}
              icon={saveOutline}
              fullWidth
            >
              {addGradeWithExamMutation.isPending
                ? 'Wird hinzugefügt...'
                : 'Note hinzufügen'}
            </GlassButton>
          </GlassForm>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default AddGradePage;
