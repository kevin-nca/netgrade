import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  IonPage,
  IonToast,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonModal,
} from '@ionic/react';
import { useForm } from '@tanstack/react-form';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import ValidatedNumberInput from '@/components/Form/validated-number-input/validatedNumberInput';
import {
  useExam,
  useUpdateExam,
  useDeleteExam,
  useAddGradeWithExam,
  useSubjects,
} from '@/hooks/queries';
import {
  validateGrade,
  validateWeight,
  percentageToDecimal,
} from '@/utils/validation';
import { useToast } from '@/hooks/useToast';
import { Routes } from '@/routes';
import { Subject } from '@/db/entities';

interface ExamFormData {
  title: string;
  date: string;
  subject: string;
  description: string;
}

interface GradeFormData {
  score: number;
  weight: number;
  comment: string;
}

interface ExamParams {
  examId: string;
}

const EditExamPage: React.FC = () => {
  const { examId } = useParams<ExamParams>();
  const history = useHistory();

  const { data: exam, isLoading, error } = useExam(examId);
  const { data: subjects = [] } = useSubjects();

  const { showToast, toastMessage, setShowToast, showMessage } = useToast();
  const [segmentValue, setSegmentValue] = useState<'details' | 'grade'>(
    'details',
  );
  const [showGradeConfirmModal, setShowGradeConfirmModal] = useState(false);

  const examForm = useForm({
    defaultValues: {
      title: '',
      date: '',
      subject: '',
      description: '',
    } as ExamFormData,
    onSubmit: async ({ value }) => {
      const updatedExam = {
        id: examId,
        name: value.title.trim(),
        date: new Date(value.date),
        subjectId: value.subject,
        description: value.description.trim(),
      };

      updateExamMutation.mutate(updatedExam, {
        onSuccess: () => {
          history.replace(Routes.HOME);
        },
        onError: (error) => {
          console.error('Failed to update exam:', error);
          showMessage(`Fehler: ${error.message}`);
        },
      });
    },
  });

  const gradeForm = useForm({
    defaultValues: {
      score: 0,
      weight: 100,
      comment: '',
    } as GradeFormData,
    onSubmit: async ({ value }) => {
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

      handleAddGrade(value);
    },
  });
  React.useEffect(() => {
    if (exam) {
      examForm.setFieldValue('title', exam.name);
      examForm.setFieldValue('date', exam.date.toISOString().split('T')[0]);
      examForm.setFieldValue('subject', exam.subjectId);
      examForm.setFieldValue('description', exam.description || '');
    }
  }, [exam, examForm]);

  const updateExamMutation = useUpdateExam();
  const addGradeWithExamMutation = useAddGradeWithExam();
  const deleteExamMutation = useDeleteExam();

  const handleAddGrade = (gradeData: GradeFormData) => {
    if (!exam) return;

    const examData = {
      title: examForm.getFieldValue('title') || exam.name,
      date:
        examForm.getFieldValue('date') || exam.date.toISOString().split('T')[0],
      subject: examForm.getFieldValue('subject') || exam.subjectId,
      description:
        examForm.getFieldValue('description') || exam.description || '',
    };

    const updatedExam = {
      id: examId,
      name: examData.title.trim(),
      date: new Date(examData.date),
      subjectId: examData.subject,
      description: examData.description.trim(),
      isCompleted: true,
    };

    updateExamMutation.mutate(updatedExam, {
      onSuccess: () => {
        const gradePayload = {
          subjectId: exam.subjectId,
          examName: exam.name,
          date: exam.date,
          score: gradeData.score,
          weight: percentageToDecimal(gradeData.weight), // Convert percentage to decimal for storage
          comment: gradeData.comment.trim() || undefined,
        };

        addGradeWithExamMutation.mutate(gradePayload, {
          onSuccess: () => {
            showMessage('Note wurde erfolgreich eingetragen.');
            setShowGradeConfirmModal(false);
            history.replace(Routes.HOME);
          },
          onError: (error) => {
            console.error('Failed to add grade:', error);
            showMessage(
              `Fehler beim Eintragen der Note: ${error instanceof Error ? error.message : String(error)}`,
            );
          },
        });
      },
      onError: (error) => {
        console.error('Failed to update exam:', error);
        showMessage(`Fehler: ${error.message}`);
      },
    });
  };

  const handleDelete = () => {
    const currentTitle = examForm.getFieldValue('title') || exam?.name || '';
    if (
      window.confirm(
        `Möchten Sie die Prüfung "${currentTitle}" wirklich löschen?`,
      )
    ) {
      deleteExamMutation.mutate(examId, {
        onSuccess: () => {
          history.replace(Routes.HOME);
        },
        onError: (error) => {
          console.error('Failed to delete exam:', error);
          showMessage(`Fehler: ${error.message}`);
        },
      });
    }
  };

  if (isLoading) {
    return <IonPage>Loading...</IonPage>;
  }

  if (error) {
    return <IonPage>Error: {error.message}</IonPage>;
  }

  return (
    <IonPage>
      <Header
        title={'Prüfung bearbeiten'}
        backButton={true}
        defaultHref={Routes.HOME}
        endSlot={
          <Button
            handleEvent={handleDelete}
            text={'Löschen'}
            color="danger"
            fill={'solid'}
          />
        }
      />
      <IonContent>
        <IonSegment
          value={segmentValue}
          onIonChange={(e) =>
            setSegmentValue(e.detail.value as 'details' | 'grade')
          }
        >
          <IonSegmentButton value="details">
            <IonLabel>Details</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="grade">
            <IonLabel>Note eintragen</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {segmentValue === 'details' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              examForm.handleSubmit();
            }}
          >
            <examForm.Field name="title">
              {(field) => (
                <FormField
                  label={'Titel'}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(String(value) || '')}
                  placeholder={'Titel bearbeiten'}
                />
              )}
            </examForm.Field>

            <examForm.Field name="date">
              {(field) => (
                <FormField
                  label={'Datum'}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(String(value) || '')}
                  type="date"
                />
              )}
            </examForm.Field>

            <examForm.Field name="subject">
              {(field) => (
                <FormField
                  label={'Fach'}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(String(value) || '')}
                  type="select"
                  options={subjects.map((subject: Subject) => ({
                    value: subject.id,
                    label: subject.name,
                  }))}
                />
              )}
            </examForm.Field>

            <examForm.Field name="description">
              {(field) => (
                <FormField
                  label={'Beschreibung'}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(String(value) || '')}
                  placeholder={'Beschreibung bearbeiten'}
                />
              )}
            </examForm.Field>

            <Button
              handleEvent={() => examForm.handleSubmit()}
              text={'Speichern'}
            />
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              gradeForm.handleSubmit();
            }}
          >
            <div className="ion-padding">
              <p>
                Tragen Sie hier die Note für die Prüfung &#34;
                {examForm.getFieldValue('title') || exam?.name}&#34; ein:
              </p>
              <p className="ion-padding-vertical ion-text-small">
                Wenn Sie eine Note eintragen, wird die Prüfung aus den
                anstehenden Prüfungen entfernt.
              </p>
            </div>

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

            <gradeForm.Field name="comment">
              {(field) => (
                <FormField
                  label={'Kommentar:'}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(String(value) || '')}
                  placeholder={'Kommentar zur Note'}
                />
              )}
            </gradeForm.Field>

            <Button
              handleEvent={() => setShowGradeConfirmModal(true)}
              text={'Note eintragen'}
            />
          </form>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="danger"
        />

        <IonModal
          isOpen={showGradeConfirmModal}
          onDidDismiss={() => setShowGradeConfirmModal(false)}
        >
          <Header title="Note eintragen" backButton={false} />
          <IonContent className="ion-padding">
            <h2>Sind Sie sicher?</h2>
            <p>
              Durch das Eintragen einer Note wird die Prüfung &#34;
              {examForm.getFieldValue('title') || exam?.name}&#34; als
              abgeschlossen markiert und aus der Liste der anstehenden Prüfungen
              entfernt.
            </p>
            <p className="ion-padding-top">
              Note: {gradeForm.getFieldValue('score')}
              <br />
              Gewichtung: {gradeForm.getFieldValue('weight')}%
            </p>
            <div className="ion-padding-top">
              <Button
                handleEvent={() => gradeForm.handleSubmit()}
                text={'Bestätigen'}
              />
              <Button
                handleEvent={() => setShowGradeConfirmModal(false)}
                text={'Abbrechen'}
                color="medium"
              />
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default EditExamPage;
