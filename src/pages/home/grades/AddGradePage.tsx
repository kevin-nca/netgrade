import React, { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
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
  const location = useLocation<{
    schoolId?: string;
    subjectId?: string;
  }>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  const form = useForm({
    defaultValues: {
      selectedSchoolId: location.state?.schoolId || '',
      selectedSubjectId: '',
      examName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: 100,
      score: 0,
      comment: '',
    } as GradeAddFormData,
    onSubmit: async ({ value }) => {
      const gradeError = validateGrade(value.score);
      if (gradeError) {
        showAndSetToastMessage(gradeError);
        return;
      }

      const weightError = validateWeight(value.weight);
      if (weightError) {
        showAndSetToastMessage(weightError);
        return;
      }

      const gradePayload = {
        subjectId: value.selectedSubjectId,
        examName: value.examName.trim(),
        date: parseISO(value.date),
        score: value.score,
        weight: percentageToDecimal(value.weight),
        comment: value.comment.trim() || undefined,
      };

      addGradeWithExamMutation.mutate(gradePayload, {
        onSuccess: () => {
          form.reset();
          form.setFieldValue(
            'selectedSchoolId',
            location.state?.schoolId || '',
          );
          form.setFieldValue('date', format(new Date(), 'yyyy-MM-dd'));
          form.setFieldValue('weight', 100);
          history.push(Routes.HOME);
          showAndSetToastMessage('Note erfolgreich hinzugefügt.');
        },
        onError: (error) => {
          showAndSetToastMessage(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      });
    },
    validators: {
      onSubmit: ({ value }) => {
        if (!value.selectedSubjectId) {
          showAndSetToastMessage('Bitte wähle ein Fach aus!');
          return 'Bitte wähle ein Fach aus!';
        }
        if (!value.examName.trim()) {
          showAndSetToastMessage('Bitte gib einen Prüfungsnamen ein!');
          return 'Bitte gib einen Prüfungsnamen ein!';
        }
        return undefined;
      },
    },
  });

  const { data: schools = [], error: schoolsError } = useSchools();
  const [selectedSchoolId, setSelectedSchoolId] = useState(
    location.state?.schoolId || '',
  );
  const { data: subjects = [], error: subjectsError } =
    useSchoolSubjects(selectedSchoolId);
  useEffect(() => {
    const state = location.state || {};
    if (state.schoolId) {
      form.setFieldValue('selectedSchoolId', state.schoolId);
      setSelectedSchoolId(state.schoolId); // Also update state for query
    }
    if (state.subjectId) {
      form.setFieldValue('selectedSubjectId', state.subjectId);
    }
  }, [form, location.state]);

  // Show error messages if fetching fails
  useEffect(() => {
    if (schoolsError) {
      showAndSetToastMessage('Failed to fetch schools');
    }

    if (subjectsError) {
      showAndSetToastMessage('Failed to fetch subjects');
    }
  }, [schoolsError, subjectsError]);

  const handleSubjectChange = (value: string | number | boolean) => {
    form.setFieldValue('selectedSubjectId', String(value));
  };

  const handleSchoolChange = (value: string | number | boolean) => {
    const newSchoolId = String(value);
    form.setFieldValue('selectedSchoolId', newSchoolId);
    form.setFieldValue('selectedSubjectId', '');
    setSelectedSchoolId(newSchoolId);
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
      form.setFieldValue(field, isNaN(parsedValue) ? 0 : parsedValue);
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
    form.handleSubmit();
  };

  return (
    <IonPage>
      <Header
        title={'Note hinzufügen'}
        backButton={true}
        onBack={() => window.history.back()}
      />
      <IonContent fullscreen>
        <form.Field name="selectedSchoolId">
          {(field) => (
            <FormField
              label="Schule"
              value={field.state.value}
              onChange={(value) => {
                handleSchoolChange(value);
              }}
              type="select"
              options={schools.map((school: School) => ({
                value: school.id,
                label: school.name,
              }))}
            />
          )}
        </form.Field>

        <form.Field name="selectedSubjectId">
          {(field) => (
            <FormField
              label="Fach"
              value={field.state.value}
              onChange={(value) => {
                handleSubjectChange(value);
              }}
              type="select"
              options={subjects.map((subject: Subject) => ({
                value: subject.id,
                label: subject.name,
              }))}
              disabled={
                !form.state.values.selectedSchoolId || subjects.length === 0
              }
              placeholder="Bitte zuerst Schule wählen"
            />
          )}
        </form.Field>

        <form.Field name="examName">
          {(field) => (
            <FormField
              label="Prüfungsname"
              value={field.state.value}
              onChange={(value) => field.handleChange(String(value))}
              type="text"
              placeholder="z.B. Klausur 1, Vokabeltest"
            />
          )}
        </form.Field>

        <form.Field name="date">
          {(field) => (
            <FormField
              label="Datum"
              value={field.state.value}
              onChange={(value) => field.handleChange(String(value))}
              type="date"
            />
          )}
        </form.Field>

        <form.Field name="weight">
          {(field) => (
            <FormField
              label="Gewichtung (0 bis 100%)"
              value={field.state.value}
              onChange={(value) => {
                handleWeightChange(value);
              }}
              type="number"
            />
          )}
        </form.Field>

        <form.Field name="score">
          {(field) => (
            <FormField
              label="Note (1 bis 6)"
              value={field.state.value}
              onChange={(value) => {
                handleScoreChange(value);
              }}
              type="number"
            />
          )}
        </form.Field>

        <form.Field name="comment">
          {(field) => (
            <FormField
              label="Kommentar (optional)"
              value={field.state.value}
              onChange={(value) => field.handleChange(String(value))}
              type="text"
            />
          )}
        </form.Field>

        <Button handleEvent={handleAddGrade} text={'Hinzufügen'} />

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="danger"
        />
      </IonContent>

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </IonPage>
  );
};

export default AddGradePage;
