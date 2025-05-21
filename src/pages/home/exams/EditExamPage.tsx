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
import { validateGrade, validateWeight } from '@/utils/validation';
import { useToast } from '@/hooks/useToast';
import { useFormHandler } from '@/hooks/useFormHandler';
import { Routes } from '@/routes';
import { Subject } from '@/db/entities';

interface ExamFormData {
  id: string;
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

  const initialExamFormData: ExamFormData = {
    id: examId,
    title: '',
    date: '',
    subject: '',
    description: '',
  };

  const initialGradeFormData: GradeFormData = {
    score: 0,
    weight: 1.0,
    comment: '',
  };

  const {
    formData: examFormData,
    setFormData: setExamFormData,
    handleChange: handleExamFormChange,
  } = useFormHandler<ExamFormData>(initialExamFormData);

  const { formData: gradeFormData, handleChange: handleGradeFormChange } =
    useFormHandler<GradeFormData>(initialGradeFormData);

  const { showToast, toastMessage, setShowToast, showMessage } = useToast();
  const [segmentValue, setSegmentValue] = useState<'details' | 'grade'>(
    'details',
  );
  const [showGradeConfirmModal, setShowGradeConfirmModal] = useState(false);

  // Update form data when exam data is loaded
  React.useEffect(() => {
    if (exam) {
      setExamFormData({
        id: exam.id,
        title: exam.name,
        date: exam.date.toISOString().split('T')[0],
        subject: exam.subjectId,
        description: exam.description || '',
      });
    }
  }, [exam, setExamFormData]);

  const updateExamMutation = useUpdateExam();
  const addGradeWithExamMutation = useAddGradeWithExam();
  const deleteExamMutation = useDeleteExam();

  const handleSave = () => {
    const updatedExam = {
      id: examFormData.id,
      name: examFormData.title.trim(),
      date: new Date(examFormData.date),
      subjectId: examFormData.subject,
      description: examFormData.description.trim(),
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
  };

  const handleAddGrade = () => {
    if (!exam) return;

    if (gradeFormData.score < 1 || gradeFormData.score > 6) {
      showMessage('Die Note muss zwischen 1 und 6 liegen.');
      return;
    }

    if (gradeFormData.weight <= 0 || gradeFormData.weight > 1) {
      showMessage('Die Gewichtung muss zwischen 0 und 1 liegen.');
      return;
    }

    const updatedExam = {
      id: examFormData.id,
      name: examFormData.title.trim(),
      date: new Date(examFormData.date),
      subjectId: examFormData.subject,
      description: examFormData.description.trim(),
      isCompleted: true,
    };

    updateExamMutation.mutate(updatedExam, {
      onSuccess: () => {
        const gradePayload = {
          subjectId: exam.subjectId,
          examName: exam.name,
          date: exam.date,
          score: gradeFormData.score,
          weight: gradeFormData.weight,
          comment: gradeFormData.comment.trim() || undefined,
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
    if (
      window.confirm(
        `Möchten Sie die Prüfung "${examFormData.title}" wirklich löschen?`,
      )
    ) {
      deleteExamMutation.mutate(examFormData.id, {
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
          <>
            <FormField
              label={'Titel'}
              value={examFormData.title}
              onChange={(value) =>
                handleExamFormChange('title', String(value) || '')
              }
              placeholder={'Titel bearbeiten'}
            />
            <FormField
              label={'Datum'}
              value={examFormData.date}
              onChange={(value) =>
                handleExamFormChange('date', String(value) || '')
              }
              type="date"
            />
            <FormField
              label={'Fach'}
              value={examFormData.subject}
              onChange={(value) =>
                handleExamFormChange('subject', String(value) || '')
              }
              type="select"
              options={subjects.map((subject: Subject) => ({
                value: subject.id,
                label: subject.name,
              }))}
            />
            <FormField
              label={'Beschreibung'}
              value={examFormData.description}
              onChange={(value) =>
                handleExamFormChange('description', String(value) || '')
              }
              placeholder={'Beschreibung bearbeiten'}
            />

            <Button handleEvent={handleSave} text={'Speichern'} />
          </>
        ) : (
          <>
            <div className="ion-padding">
              <p>
                Tragen Sie hier die Note für die Prüfung &#34;
                {examFormData.title}&#34; ein:
              </p>
              <p className="ion-padding-vertical ion-text-small">
                Wenn Sie eine Note eintragen, wird die Prüfung aus den
                anstehenden Prüfungen entfernt.
              </p>
            </div>

            <ValidatedNumberInput
              label="Note"
              value={gradeFormData.score}
              onChange={(val) => handleGradeFormChange('score', val)}
              validation={validateGrade}
            />

            <ValidatedNumberInput
              label="Gewichtung"
              value={gradeFormData.weight}
              onChange={(val) => handleGradeFormChange('weight', val)}
              validation={validateWeight}
            />

            <FormField
              label={'Kommentar:'}
              value={gradeFormData.comment}
              onChange={(value) =>
                handleGradeFormChange('comment', String(value) || '')
              }
              placeholder={'Kommentar zur Note'}
            />

            <Button
              handleEvent={() => setShowGradeConfirmModal(true)}
              text={'Note eintragen'}
            />
          </>
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
              {examFormData.title}&#34; als abgeschlossen markiert und aus der
              Liste der anstehenden Prüfungen entfernt.
            </p>
            <p className="ion-padding-top">
              Note: {gradeFormData.score}
              <br />
              Gewichtung: {gradeFormData.weight}
            </p>
            <div className="ion-padding-top">
              <Button handleEvent={handleAddGrade} text={'Bestätigen'} />
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
