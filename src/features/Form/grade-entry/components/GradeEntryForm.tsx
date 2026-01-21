import React, { useState } from 'react';
import {
  IonButtons,
  IonContent,
  IonIcon,
  IonList,
  IonModal,
  IonToast,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import GradeListItem from '@/components/List/GradeListItem';
import { Grade } from '@/db/entities';
import {
  useDeleteGrade,
  useSubject,
  useSubjectGrades,
  useUpdateExamAndGrade,
} from '@/hooks/queries';
import { decimalToPercentage, percentageToDecimal } from '@/utils/validation';
import { Layout } from '@/components/Layout/Layout';
import { Routes } from '@/routes';
import { useAppForm } from '@/shared/Form/ui/form';
import {
  type EditGradeFormData,
  editGradeSchema,
  type GradeEntryParams,
} from '@/features/Form/grade-entry/schema/gradeEntryFormShema';

const GradeEntryForm: React.FC = () => {
  const { subjectId } = useParams<GradeEntryParams>();
  const history = useHistory();

  const { data: grades } = useSubjectGrades(subjectId);
  const { data: subject } = useSubject(subjectId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const deleteGradeMutation = useDeleteGrade();
  const updateExamAndGradeMutation = useUpdateExamAndGrade();

  const form = useAppForm({
    defaultValues: {
      examName: '',
      score: undefined as number | undefined,
      weight: '',
      date: '',
      comment: '',
    } as EditGradeFormData,
    validators: {
      onSubmit: editGradeSchema,
    },
    onSubmit: async ({ value }) => {
      if (!editingId) return;

      const grade = grades?.find((g: Grade) => g.id === editingId);
      if (!grade) return;

      const scoreNumber = value.score!;
      const weightNumber = +String(value.weight).replace(',', '.');

      const updatedGrade = {
        ...grade,
        score: scoreNumber,
        weight: percentageToDecimal(weightNumber),
        date: new Date(value.date),
        comment: value.comment || null,
      };

      const updatedExam = {
        ...grade.exam,
        name: value.examName.trim(),
      };

      updateExamAndGradeMutation.mutate(
        {
          examData: updatedExam,
          gradeData: updatedGrade,
        },
        {
          onSuccess: () => {
            setToastMessage('Note erfolgreich aktualisiert.');
            setShowToast(true);
            setEditingId(null);
            form.reset();
          },
          onError: (error) => {
            setToastMessage(
              `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            );
            setShowToast(true);
          },
        },
      );
    },
  });

  const handleDelete = (gradeId: string) => {
    deleteGradeMutation.mutate(gradeId, {
      onSuccess: () => {
        setToastMessage('Note erfolgreich gelöscht.');
        setShowToast(true);
      },
      onError: (error) => {
        setToastMessage(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        );
        setShowToast(true);
      },
    });
  };

  const startEdit = (grade: Grade) => {
    setEditingId(grade.id);
    form.setFieldValue('examName', grade.exam.name);
    form.setFieldValue('score', grade.score);
    form.setFieldValue('weight', String(decimalToPercentage(grade.weight)));
    form.setFieldValue('date', grade.date.toISOString().split('T')[0]);
    form.setFieldValue('comment', grade.comment || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  const handleSaveEdit = () => {
    form.handleSubmit();
  };

  return (
    <>
      <Header
        title={subject?.name ?? ''}
        backButton
        onBack={() => window.history.back()}
        endSlot={
          <IonButtons slot="end">
            <Button
              handleEvent={() => {
                history.push(Routes.GRADES_ADD);
              }}
              text={<IonIcon icon={add} />}
            />
          </IonButtons>
        }
      />
      <IonContent>
        <Layout>
          {!grades || grades.length === 0 ? (
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
              <div className="ion-padding">
                <form.AppField name="examName">
                  {(field) => <field.ExamNameField label="Prüfungsname" />}
                </form.AppField>

                <form.AppField name="score">
                  {(field) => <field.GradeScoreField label="Note (1-6)" />}
                </form.AppField>

                <form.AppField name="weight">
                  {(field) => <field.WeightField label="Gewichtung (0-100%)" />}
                </form.AppField>

                <form.AppField name="date">
                  {(field) => <field.DateField label="Datum" />}
                </form.AppField>

                <form.AppField name="comment">
                  {(field) => (
                    <field.DescriptionField label="Kommentar (optional)" />
                  )}
                </form.AppField>

                <Button handleEvent={handleSaveEdit} text="Speichern" />
                <Button
                  handleEvent={cancelEdit}
                  text="Abbrechen"
                  color="medium"
                />
              </div>
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
    </>
  );
};

export default GradeEntryForm;
