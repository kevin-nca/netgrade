import React, { useState } from 'react';
import {
  IonContent,
  IonList,
  IonModal,
  IonPage,
  IonToast,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { add } from 'ionicons/icons';
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
import { Layout } from '@/components/Layout/Layout';
import { Routes } from '@/routes';

interface GradeFormData {
  examName: string;
  score: number;
  weight: number;
  date: string;
  comment: string;
}

const AllGradeEntryPage: React.FC = () => {
  const history = useHistory();

  const {
    data: allGrades = [],
    error: gradesError,
    isLoading: gradesLoading,
  } = useGrades();

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
    gradeForm.setFieldValue('examName', grade.exam.name);
    gradeForm.setFieldValue('score', grade.score);
    gradeForm.setFieldValue('weight', decimalToPercentage(grade.weight));
    gradeForm.setFieldValue('date', grade.date.toISOString().split('T')[0]);
    gradeForm.setFieldValue('comment', grade.comment || '');
  };

  const saveEdit = async (formData: GradeFormData) => {
    if (!editingId) return;

    const grade = allGrades.find((grade: Grade) => grade.id === editingId);
    if (!grade) return;

    const updatedGrade = {
      ...grade,
      score: formData.score,
      weight: percentageToDecimal(formData.weight),
      date: new Date(formData.date),
      comment: formData.comment || null,
    };

    const updatedExam = {
      ...grade.exam,
      name: formData.examName,
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
          showMessage(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      },
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <IonPage>
      <Header
        title="Notenübersicht"
        backButton
        onBack={() => window.history.back()}
        endSlot={
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={() => history.push(Routes.GRADES_ADD)}
            >
              <IonIcon icon={add} />
            </IonButton>
          </IonButtons>
        }
      />
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
          ) : allGrades.length === 0 ? (
            <div className="ion-padding ion-text-center">
              <p>Keine Noten gefunden.</p>
            </div>
          ) : (
            <IonList>
              {allGrades.map((grade) => (
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
                      onChange={(val) => field.handleChange(String(val))}
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

export default AllGradeEntryPage;
