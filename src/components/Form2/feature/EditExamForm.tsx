import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import {
  alertCircleOutline,
  calendarOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  createOutline,
  documentTextOutline,
  scaleOutline,
  schoolOutline,
  trashOutline,
  trophyOutline,
} from 'ionicons/icons';
import type { Updater } from '@tanstack/react-form';
import { DeepRecord, useForm } from '@tanstack/react-form';
import {
  useAddGradeWithExam,
  useDeleteExam,
  useExam,
  useSubjects,
  useUpdateExam,
} from '@/hooks';
import {
  percentageToDecimal,
  validateGrade,
  validateWeight,
} from '@/utils/validation';
import { Routes } from '@/routes';

import styles from './EditExamPage.module.css';
import { Layout } from '@/components/Layout/Layout';
import {
  ExamFormData,
  ExamParams,
  GradeFormData,
} from '@/pages/home/exams/EditExamPage/types';
import {
  formatDate,
  getGradeColor,
} from '@/pages/home/exams/EditExamPage/utils';
import { ExamDetailsPage } from '@/pages/home/exams/EditExamPage/components/ExamDetailsPage';
import { GradeForm } from '@/pages/home/exams/EditExamPage/components/GradeForm';

const EditExamForm: React.FC = () => {
  const { examId } = useParams<ExamParams>();
  const history = useHistory();

  const { data: exam, error } = useExam(examId);
  const { data: subjects = [] } = useSubjects();

  const [segmentValue, setSegmentValue] = useState<'details' | 'grade'>(
    'details',
  );
  const [showGradeConfirmModal, setShowGradeConfirmModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('primary');
  const [showToast, setShowToast] = useState(false);

  const examForm = useForm({
    defaultValues: {
      title: '',
      date: '',
      subject: '',
      description: '',
    } as ExamFormData,
    onSubmit: async ({ value }) => {
      if (!value.title || !value.date || !value.subject) {
        showMessage('Bitte fülle alle erforderlichen Felder aus.', 'warning');
        return;
      }

      const updatedExam = {
        id: examId,
        name: value.title.trim(),
        date: new Date(value.date),
        subjectId: value.subject,
        description: value.description.trim(),
      };

      updateExamMutation.mutate(updatedExam, {
        onSuccess: () => {
          showMessage('Prüfung erfolgreich aktualisiert!', 'success');
          setTimeout(() => history.replace(Routes.HOME), 1500);
        },
        onError: (error: Error) => {
          showMessage(`Fehler: ${error.message}`, 'danger');
        },
      });
    },
  });

  const gradeForm = useForm({
    defaultValues: {
      score: 5.5,
      weight: 100,
      comment: '',
    } as GradeFormData,
    onSubmit: async ({ value }) => {
      const gradeError = validateGrade(value.score);
      if (gradeError) {
        showMessage(gradeError, 'warning');
        return;
      }

      const weightError = validateWeight(value.weight);
      if (weightError) {
        showMessage(weightError, 'warning');
        return;
      }

      setShowGradeConfirmModal(true);
    },
  });

  const examFormValues = examForm.state.values as ExamFormData;
  const gradeFormValues = gradeForm.state.values as GradeFormData;

  useEffect(() => {
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

  const showMessage = (message: string, color: string = 'primary') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleAddGrade = () => {
    if (!exam) return;

    const updatedExam = {
      id: examId,
      name: examFormValues.title.trim(),
      date: new Date(examFormValues.date),
      subjectId: examFormValues.subject,
      description: examFormValues.description.trim(),
      isCompleted: true,
    };

    updateExamMutation.mutate(updatedExam, {
      onSuccess: () => {
        const gradePayload = {
          subjectId: exam.subjectId,
          examName: exam.name,
          date: exam.date,
          score: gradeFormValues.score,
          weight: percentageToDecimal(gradeFormValues.weight),
          comment: gradeFormValues.comment.trim() || undefined,
        };

        addGradeWithExamMutation.mutate(gradePayload, {
          onSuccess: () => {
            showMessage('Note erfolgreich eingetragen!', 'success');
            setShowGradeConfirmModal(false);
            setTimeout(() => history.replace(Routes.HOME), 1500);
          },
          onError: (error: Error) => {
            showMessage(
              `Fehler beim Eintragen der Note: ${error.message}`,
              'danger',
            );
          },
        });
      },
      onError: (error: Error) => {
        showMessage(`Fehler: ${error.message}`, 'danger');
      },
    });
  };

  const handleDelete = () => {
    deleteExamMutation.mutate(examId, {
      onSuccess: () => {
        showMessage('Prüfung wurde gelöscht', 'warning');
        history.replace(Routes.HOME);
      },
      onError: (error: Error) => {
        showMessage(`Fehler: ${error.message}`, 'danger');
      },
    });
  };

  if (error) {
    return (
      <>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={Routes.HOME} />
            </IonButtons>
            <IonTitle>Fehler</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <Layout>
            <div className={styles.container}>
              <IonCard className={styles.errorCard}>
                <IonCardHeader>
                  <IonCardTitle className={styles.errorCardTitle}>
                    <IonIcon icon={alertCircleOutline} />
                    Fehler beim Laden
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className={styles.errorCardText}>{error.message}</p>
                  <IonButton
                    expand="block"
                    fill="solid"
                    color="light"
                    className="modern-button"
                    onClick={() => history.replace(Routes.HOME)}
                  >
                    Zurück zur Übersicht
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </div>
          </Layout>
        </IonContent>
      </>
    );
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={Routes.HOME} text="Zurück" />
          </IonButtons>
          <IonTitle>Prüfung bearbeiten</IonTitle>
          <IonButtons slot="end">
            <IonButton color="danger" onClick={() => setShowDeleteAlert(true)}>
              <IonIcon slot="icon-only" icon={trashOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <Layout>
          <div className={styles.container}>
            {exam && (
              <IonCard className={styles.headerCard}>
                <IonCardHeader className={styles.headerCardContent}>
                  <IonCardTitle className={styles.headerCardTitle}>
                    {examFormValues.title || exam.name}
                  </IonCardTitle>
                  <IonCardSubtitle className={styles.headerCardSubtitle}>
                    <div className={styles.headerCardInfo}>
                      <div className={styles.headerCardInfoRow}>
                        <IonIcon icon={calendarOutline} />
                        {formatDate(new Date(examFormValues.date || exam.date))}
                      </div>
                      <div className={styles.headerCardInfoRow}>
                        <IonIcon icon={schoolOutline} />
                        {subjects.find(
                          (s) =>
                            s.id === (examFormValues.subject || exam.subjectId),
                        )?.name || 'Unbekanntes Fach'}
                      </div>
                    </div>
                  </IonCardSubtitle>
                </IonCardHeader>
              </IonCard>
            )}

            <IonSegment
              value={segmentValue}
              onIonChange={(e) =>
                setSegmentValue(e.detail.value as 'details' | 'grade')
              }
              className={styles.segment}
            >
              <IonSegmentButton
                value="details"
                className={styles.segmentButton}
              >
                <IonLabel className={styles.segmentLabel}>
                  <IonIcon icon={createOutline} />
                  Details
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="grade" className={styles.segmentButton}>
                <IonLabel className={styles.segmentLabel}>
                  <IonIcon icon={trophyOutline} />
                  Note
                </IonLabel>
              </IonSegmentButton>
            </IonSegment>
            {segmentValue === 'details' ? (
              <ExamDetailsPage
                formValues={examForm.state.values as ExamFormData}
                onFieldChange={(field, value) =>
                  examForm.setFieldValue(
                    field as keyof ExamFormData,
                    value as Updater<
                      DeepRecord<ExamFormData>[keyof ExamFormData]
                    >,
                  )
                }
                subjects={subjects}
                isSubmitting={updateExamMutation.isPending}
                onSubmit={examForm.handleSubmit}
              />
            ) : (
              <GradeForm
                formValues={gradeForm.state.values as GradeFormData}
                onFieldChange={(field, value) =>
                  gradeForm.setFieldValue(
                    field as keyof GradeFormData,
                    value as Updater<
                      DeepRecord<GradeFormData>[keyof GradeFormData]
                    >,
                  )
                }
                getGradeColor={getGradeColor}
                onSubmit={gradeForm.handleSubmit}
              />
            )}
          </div>

          {/* Grade Confirmation Modal */}
          <IonModal
            isOpen={showGradeConfirmModal}
            onDidDismiss={() => setShowGradeConfirmModal(false)}
            className={styles.modal}
          >
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowGradeConfirmModal(false)}
                ></button>
                <h2 className={styles.modalTitle}>Note bestätigen</h2>
                <p className={styles.modalSubtitle}>
                  Überprüfe deine Eingaben vor dem Speichern
                </p>
              </div>
              <div className={styles.contentContainer}>
                <div className={`${styles.gradeCard} ${styles.animateIn}`}>
                  <div className={styles.gradeDisplay}>
                    <div
                      className={`${styles.gradeCircle} ${styles[getGradeColor(gradeFormValues.score)]}`}
                    >
                      <span className={styles.gradeValue}>
                        {gradeFormValues.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className={styles.gradeLabel}>Deine Note</p>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      <div className={styles.infoIcon}>
                        <IonIcon icon={documentTextOutline} />
                      </div>
                      <span className={styles.infoLabel}>Prüfung</span>
                    </div>
                    <div className={styles.infoValue}>
                      {examFormValues.title || exam?.name}
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      <div className={styles.infoIcon}>
                        <IonIcon icon={scaleOutline} />
                      </div>
                      <span className={styles.infoLabel}>Gewichtung</span>
                    </div>
                    <div className={styles.infoValue}>
                      {gradeFormValues.weight}%
                    </div>
                  </div>
                  {gradeFormValues.comment && (
                    <div className={`${styles.infoCard} ${styles.commentCard}`}>
                      <div className={styles.infoCardHeader}>
                        <div className={styles.infoIcon}>
                          <IonIcon icon={chatbubbleOutline} />
                        </div>
                        <span className={styles.infoLabel}>Kommentar</span>
                      </div>
                      <p className={styles.commentText}>
                        &#34;{gradeFormValues.comment}&#34;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.actionContainer}>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.confirmButton}
                    onClick={handleAddGrade}
                    disabled={addGradeWithExamMutation.isPending}
                  >
                    {addGradeWithExamMutation.isPending ? (
                      <>
                        <div className={styles.spinner} />
                        Wird gespeichert...
                      </>
                    ) : (
                      <>
                        <IonIcon
                          icon={checkmarkCircleOutline}
                          className={styles.buttonIcon}
                        />
                        Speichern
                      </>
                    )}
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowGradeConfirmModal(false)}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </IonModal>
          {/* Delete Alert */}
          <IonAlert
            isOpen={showDeleteAlert}
            onDidDismiss={() => setShowDeleteAlert(false)}
            header="Prüfung löschen?"
            message={`Möchtest du die Prüfung "${examFormValues.title || exam?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
            buttons={[
              {
                text: 'Abbrechen',
                role: 'cancel',
                handler: () => setShowDeleteAlert(false),
              },
              {
                text: 'Löschen',
                role: 'destructive',
                handler: handleDelete,
              },
            ]}
          />

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={2000}
            position="top"
            color={toastColor}
            animated
          />
        </Layout>
      </IonContent>
    </>
  );
};

export default EditExamForm;
