import React, { useState } from 'react';
import { IonContent, IonList, IonModal, IonPage, IonToast } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import ValidatedNumberInput from '@/components/Form/validated-number-input/validatedNumberInput';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import GradeListItem from '@/components/List/GradeListItem';
import FormField from '@/components/Form/FormField';
import { Grade } from '@/db/entities';
import {
  useGrades,
  useDeleteGrade,
  useUpdateExamAndGrade,
} from '@/hooks/queries';
import {
  validateGrade,
  validateWeight,
  percentageToDecimal,
  decimalToPercentage,
} from '@/utils/validation';
import { useToast } from '@/hooks/useToast';
import { Routes } from '@/routes';
import { Layout } from '@/components/Layout/Layout';

interface GradeFormData {
  examName: string;
  score: number;
  weight: number;
  date: string;
  comment: string;
}

interface GradeEntryParams {
  schoolId: string;
  subjectId: string;
}

// Helper function to format date for input (YYYY-MM-DD)
const formatDateForInput = (date: Date | string): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      // Return today's date if invalid
      return new Date().toISOString().split('T')[0];
    }
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().split('T')[0];
  }
};

// Helper function to create date from input string
const createDateFromInput = (dateString: string): Date => {
  if (!dateString || dateString.trim() === '') {
    throw new Error('Datum darf nicht leer sein');
  }

  // Parse YYYY-MM-DD format
  const date = new Date(dateString + 'T00:00:00.000Z');
  if (isNaN(date.getTime())) {
    throw new Error('Ungültiges Datumsformat');
  }

  return date;
};

const GradeEntryPage: React.FC = () => {
  const { subjectId } = useParams<GradeEntryParams>();

  const {
    data: allGrades = [],
    error: gradesError,
    isLoading: gradesLoading,
  } = useGrades();

  const grades = allGrades.filter(
    (grade: Grade) => grade.exam.subjectId === subjectId,
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const { showToast, toastMessage, setShowToast, showMessage } = useToast();

  const gradeForm = useForm({
    defaultValues: {
      examName: '',
      score: 0,
      weight: 100,
      date: '',
      comment: '',
    } as GradeFormData,
    onSubmit: async ({ value }) => {
      if (!value.examName.trim()) {
        showMessage('Bitte geben Sie einen Prüfungsnamen ein.');
        return;
      }

      if (!value.date || value.date.trim() === '') {
        showMessage('Bitte wählen Sie ein Datum aus.');
        return;
      }

      const gradeError = validateGrade(value.score);
      if (gradeError) {
        showMessage(gradeError);
        return;
      }

      const weightError = validateWeight(value.weight);
      if (weightError) {
        showMessage(weightError);
        return;
      }

      await saveEdit(value);
    },
  });

  // Set up mutation hooks
  const deleteGradeMutation = useDeleteGrade();
  const updateExamAndGradeMutation = useUpdateExamAndGrade();

  const handleDelete = (gradeId: string) => {
    deleteGradeMutation.mutate(gradeId, {
      onSuccess: () => {
        showMessage('Note erfolgreich gelöscht.');
      },
      onError: (error) => {
        showMessage(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        );
      },
    });
  };

  const startEdit = (grade: Grade) => {
    setEditingId(grade.id);

    // Format the date properly for the input field
    const formattedDate = formatDateForInput(grade.date);

    gradeForm.setFieldValue('examName', grade.exam.name);
    gradeForm.setFieldValue('score', grade.score);
    gradeForm.setFieldValue('weight', decimalToPercentage(grade.weight));
    gradeForm.setFieldValue('date', formattedDate);
    gradeForm.setFieldValue('comment', grade.comment || '');
  };

  const saveEdit = async (formData: GradeFormData) => {
    if (!editingId) return;

    const grade = grades.find((grade: Grade) => grade.id === editingId);
    if (!grade) {
      showMessage('Note nicht gefunden.');
      return;
    }

    try {
      // Create date from input string
      const validDate = createDateFromInput(formData.date);

      const updatedGrade = {
        ...grade,
        score: formData.score,
        weight: percentageToDecimal(formData.weight),
        date: validDate,
        comment: formData.comment || null,
      };

      const updatedExam = {
        ...grade.exam,
        name: formData.examName.trim(),
      };

      updateExamAndGradeMutation.mutate(
        {
          examData: updatedExam,
          gradeData: updatedGrade,
        },
        {
          onSuccess: () => {
            showMessage('Note erfolgreich aktualisiert.');
            setEditingId(null);
          },
          onError: (error) => {
            console.error('Update error:', error);
            showMessage(
              `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            );
          },
        },
      );
    } catch (error) {
      console.error('Date error:', error);
      showMessage(error instanceof Error ? error.message : 'Ungültiges Datum');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <IonPage>
      <Header title="Notenübersicht" backButton defaultHref={Routes.HOME} />
      <IonContent>
        <Layout>
          {gradesLoading ? (
            <div className="ion-padding ion-text-center">
              <p>Noten werden geladen...</p>
            </div>
          ) : gradesError ? (
            <div className="ion-padding ion-text-center">
              <p>Fehler beim Laden der Noten.</p>
            </div>
          ) : grades.length === 0 ? (
            <div className="ion-padding ion-text-center">
              <p>Keine Noten gefunden.</p>
            </div>
          ) : (
            <IonList>
              {grades.map((grade) => (
                <GradeListItem
                  key={grade.id}
                  grade={grade}
                  onEdit={() => startEdit(grade)}
                  onDelete={() => handleDelete(grade.id)}
                />
              ))}
            </IonList>
          )}

          <IonModal isOpen={editingId !== null}>
            <Header title="Note bearbeiten" backButton={false} />
            <IonContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  gradeForm.handleSubmit();
                }}
              >
                <gradeForm.Field name="examName">
                  {(field) => (
                    <FormField
                      label="Titel:"
                      value={field.state.value}
                      onChange={(val) => field.handleChange(String(val))}
                      type="text"
                    />
                  )}
                </gradeForm.Field>

                <gradeForm.Field name="score">
                  {(field) => (
                    <ValidatedNumberInput
                      label="Note"
                      value={field.state.value}
                      onChange={(val) => field.handleChange(val)}
                      validation={validateGrade}
                    />
                  )}
                </gradeForm.Field>

                <gradeForm.Field name="weight">
                  {(field) => (
                    <ValidatedNumberInput
                      label="Gewichtung (%)"
                      value={field.state.value}
                      onChange={(val) => field.handleChange(val)}
                      validation={validateWeight}
                    />
                  )}
                </gradeForm.Field>

                <gradeForm.Field name="date">
                  {(field) => (
                    <FormField
                      label="Datum:"
                      value={field.state.value}
                      onChange={(val) => {
                        const dateValue = String(val);
                        console.log('Date field onChange:', dateValue);
                        field.handleChange(dateValue);
                      }}
                      type="date"
                    />
                  )}
                </gradeForm.Field>

                <gradeForm.Field name="comment">
                  {(field) => (
                    <FormField
                      label="Kommentar:"
                      value={field.state.value}
                      onChange={(val) => field.handleChange(String(val))}
                      type="text"
                    />
                  )}
                </gradeForm.Field>

                <Button
                  handleEvent={() => gradeForm.handleSubmit()}
                  text="Speichern"
                />
                <Button
                  handleEvent={cancelEdit}
                  text="Abbrechen"
                  color="medium"
                />
              </form>
            </IonContent>
          </IonModal>

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={2000}
            color="danger"
          />
        </Layout>
      </IonContent>
    </IonPage>
  );
};

export default GradeEntryPage;
