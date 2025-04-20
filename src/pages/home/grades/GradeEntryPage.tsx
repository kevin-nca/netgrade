import React, { useState } from 'react';
import { IonContent, IonList, IonModal, IonPage, IonToast } from '@ionic/react';
import { useParams } from 'react-router-dom';
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
import { Routes } from '@/routes';

interface GradeFormData {
  id: string | null;
  examName: string; // Attention: this is stored in a different table.
  score: number;
  weight: number;
  date: Date | null;
  comment: string | null;
}

interface GradeEntryParams {
  schoolId: string;
  subjectId: string;
}

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

  const [formData, setFormData] = useState<GradeFormData>({
    id: null,
    examName: '',
    score: 0,
    weight: 1,
    date: null,
    comment: null,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showAndSetToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Set up mutation hooks
  const deleteGradeMutation = useDeleteGrade();
  const updateExamAndGradeMutation = useUpdateExamAndGrade();

  const handleDelete = (gradeId: string) => {
    deleteGradeMutation.mutate(gradeId, {
      onSuccess: () => {
        showAndSetToastMessage('Note erfolgreich gelöscht.');
      },
      onError: (error) => {
        showAndSetToastMessage(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        );
      },
    });
  };

  const startEdit = (grade: Grade) => {
    setEditingId(grade.id);
    setFormData({
      id: grade.id,
      examName: grade.exam.name,
      score: grade.score,
      weight: grade.weight,
      date: grade.date,
      comment: grade.comment,
    });
  };

  const handleFormChange = <K extends keyof GradeFormData>(
    field: K,
    value: GradeFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = () => {
    if (editingId) {
      const grade = grades.find((grade: Grade) => grade.id === editingId)!;

      // Validate form data
      if (!formData.examName.trim()) {
        showAndSetToastMessage('Bitte geben Sie einen Prüfungsnamen ein.');
        return;
      }

      if (formData.score < 1 || formData.score > 6) {
        showAndSetToastMessage('Die Note muss zwischen 1 und 6 liegen.');
        return;
      }

      if (formData.weight < 0 || formData.weight > 1) {
        showAndSetToastMessage('Die Gewichtung muss zwischen 0 und 1 liegen.');
        return;
      }

      // Create updated grade and exam objects
      const updatedGrade = {
        ...grade,
        score: formData.score,
        weight: formData.weight,
        date: formData.date ?? new Date(),
        comment: formData.comment,
      };

      const updatedExam = {
        ...grade.exam,
        name: formData.examName,
      };

      // Update both exam and grade in a single transaction
      updateExamAndGradeMutation.mutate(
        {
          examData: updatedExam,
          gradeData: updatedGrade,
        },
        {
          onSuccess: () => {
            showAndSetToastMessage('Note erfolgreich aktualisiert.');
            setEditingId(null);
          },
          onError: (error) => {
            showAndSetToastMessage(
              `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            );
          },
        },
      );
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleWeightValidation = (value: number) => {
    if (value <= 0 || value > 1)
      return 'Bitte eine Zahl zwischen 0 und 1 eingeben.';
    if (
      value.toString().includes('.') &&
      value.toString().split('.')[1].length > 2
    ) {
      return 'Die Gewichtung darf maximal zwei Dezimalstellen haben.';
    }
    return null;
  };

  const handleGradeValidation = (value: number) => {
    if (value < 1 || value > 6)
      return 'Bitte eine Zahl zwischen 1 und 6 eingeben.';
    if (
      value.toString().includes('.') &&
      value.toString().split('.')[1].length > 2
    ) {
      return 'Die Note darf maximal zwei Dezimalstellen haben.';
    }
    return null;
  };

  const handleDateChange = (val: string | number | boolean) => {
    const newVal = typeof val === 'string' && val ? new Date(val) : null;
    handleFormChange('date', newVal);
  };

  const handleCommentChange = (val: string | number | boolean) => {
    handleFormChange('comment', val.toString());
  };

  const handleExamNameChange = (val: string | number | boolean) => {
    handleFormChange('examName', val.toString());
  };

  return (
    <IonPage>
      <Header title="Notenübersicht" backButton defaultHref={Routes.HOME} />
      <IonContent>
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
            <FormField
              label="Titel:"
              value={formData.examName ?? ''}
              onChange={handleExamNameChange}
              type="text"
            />
            <ValidatedNumberInput
              label="Note"
              value={formData.score}
              onChange={(val) => handleFormChange('score', val)}
              validation={handleGradeValidation}
            />
            <ValidatedNumberInput
              label="Gewichtung"
              value={formData.weight}
              onChange={(val) => handleFormChange('weight', val)}
              validation={handleWeightValidation}
            />
            <FormField
              label="Datum:"
              value={
                formData.date ? formData.date.toISOString().split('T')[0] : ''
              }
              onChange={handleDateChange}
              type="date"
            />

            <FormField
              label="Kommentar:"
              value={formData.comment ?? ''}
              onChange={handleCommentChange}
              type="text"
            />
            <Button handleEvent={saveEdit} text="Speichern" />
            <Button handleEvent={cancelEdit} text="Abbrechen" color="medium" />
          </IonContent>
        </IonModal>

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

export default GradeEntryPage;
