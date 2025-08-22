import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
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
  date: string; // Store as ISO string e.g., "YYYY-MM-DD"
  weight: number;
  score: number;
  comment: string;
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

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { data: schools = [], error: schoolsError } = useSchools();
  const { data: subjects = [], error: subjectsError } = useSchoolSubjects(
    formData.selectedSchoolId,
  );

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
      // Reset subject when school changes
      setFormData((prev) => ({
        ...prev,
        selectedSchoolId: routeSchoolId,
        selectedSubjectId: '',
      }));
    }
  }, [routeSchoolId, formData.selectedSchoolId]);

  const handleFormChange = <K extends keyof GradeAddFormData>(
    field: K,
    value: GradeAddFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (value: string | number | boolean) => {
    handleFormChange('selectedSubjectId', String(value));
  };

  const handleSchoolChange = (value: string | number | boolean) => {
    const newSchoolId = String(value);
    setFormData((prev) => ({
      ...prev,
      selectedSchoolId: newSchoolId,
      selectedSubjectId: '', // Reset subject when school changes
    }));
  };

  // Specific handler for Date change
  const handleDateChange = (value: string | number | boolean) => {
    // FormField for date passes ISO string
    handleFormChange('date', String(value));
  };

  // Specific handler for numeric fields to parse value
  const handleNumericChange = (
    field: 'score' | 'weight',
    value: string | number | boolean,
  ) => {
    const strValue = String(value);
    // Basic check for valid number format (allow empty string for clearing input)
    if (strValue === '' || /^-?\d*\.?\d*$/.test(strValue)) {
      // Attempt to parse, default to 0 or keep previous if parse fails?
      // For score/weight, 0 might be a valid value, handle NaN carefully
      const parsedValue = parseFloat(strValue);
      handleFormChange(field, isNaN(parsedValue) ? 0 : parsedValue);
    }
  };

  const handleScoreChange = (value: string | number | boolean) => {
    handleNumericChange('score', value);
    // Inline validation for decimals (optional immediate feedback)
    const strValue = String(value);
    if (strValue.includes('.') && strValue.split('.')[1].length > 2) {
      showAndSetToastMessage(
        'Die Note darf maximal zwei Dezimalstellen haben.',
      );
    }
  };

  const handleWeightChange = (value: string | number | boolean) => {
    handleNumericChange('weight', value);
    // Inline validation for decimals (optional immediate feedback)
    const strValue = String(value);
    if (strValue.includes('.') && strValue.split('.')[1].length > 2) {
      showAndSetToastMessage(
        'Die Gewichtung darf maximal zwei Dezimalstellen haben.',
      );
    }
  };

  const showAndSetToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const addGradeWithExamMutation = useAddGradeWithExam();

  const handleAddGrade = () => {
    if (!formData.selectedSubjectId) {
      showAndSetToastMessage('Bitte wähle ein Fach aus!');
      return;
    }
    if (!formData.examName.trim()) {
      showAndSetToastMessage('Bitte gib einen Prüfungsnamen ein!');
      return;
    }

    const gradeError = validateGrade(formData.score);
    if (gradeError) {
      showAndSetToastMessage(gradeError);
      return;
    }

    const weightError = validateWeight(formData.weight);
    if (weightError) {
      showAndSetToastMessage(weightError);
      return;
    }

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

  return (
    <IonPage>
      <Header
        title={'Note hinzufügen'}
        backButton={true}
        onBack={() => window.history.back()}
      />
      <IonContent fullscreen>
        <FormField
          label="Schule"
          value={formData.selectedSchoolId}
          onChange={handleSchoolChange}
          type="select"
          options={schools.map((school: School) => ({
            value: school.id,
            label: school.name,
          }))}
        />

        <FormField
          label="Fach"
          value={formData.selectedSubjectId}
          onChange={handleSubjectChange}
          type="select"
          options={subjects.map((subject: Subject) => ({
            value: subject.id,
            label: subject.name,
          }))}
          disabled={!formData.selectedSchoolId || subjects.length === 0}
          placeholder="Bitte zuerst Schule wählen"
        />

        <FormField
          label="Prüfungsname"
          value={formData.examName}
          onChange={(value) => handleFormChange('examName', String(value))}
          type="text"
          placeholder="z.B. Klausur 1, Vokabeltest"
        />

        <FormField
          label="Datum"
          value={formData.date}
          onChange={handleDateChange}
          type="date"
        />

        <FormField
          label="Gewichtung (0 bis 100%)"
          value={formData.weight}
          onChange={handleWeightChange}
          type="number"
        />

        <FormField
          label="Note (1 bis 6)"
          value={formData.score}
          onChange={handleScoreChange}
          type="number"
        />

        <FormField
          label="Kommentar (optional)"
          value={formData.comment}
          onChange={(value) => handleFormChange('comment', String(value))}
          type="text"
        />

        <Button handleEvent={handleAddGrade} text={'Hinzufügen'} />
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
