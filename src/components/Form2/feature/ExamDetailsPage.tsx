import React, { useState } from 'react';
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
import { useForm } from '@tanstack/react-form';
import {
  useAddGradeWithExam,
  useDeleteExam,
  useExam,
  useSubjects,
} from '@/hooks';
import {
  percentageToDecimal,
  validateGrade,
  validateWeight,
} from '@/utils/validation';
import { Routes } from '@/routes';
import styles from '@/pages/home/exams/EditExamPage/EditExamPage.module.css';
import { Layout } from '@/components/Layout/Layout';
import {
  ExamParams,
  GradeFormData,
} from '@/pages/home/exams/EditExamPage/types';
import {
  formatDate,
  getGradeColor,
} from '@/pages/home/exams/EditExamPage/utils';
import { EditExamForm } from '@/pages/home/exams/EditExamPage/components/EditExamForm';
import { GradeForm } from '@/pages/home/exams/EditExamPage/components/GradeForm';

const ExamDetailsPage: React.FC = () => {
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

  const gradeFormValues = gradeForm.state.values as GradeFormData;

  const addGradeWithExamMutation = useAddGradeWithExam();
  const deleteExamMutation = useDeleteExam();

  const showMessage = (message: string, color: string = 'primary') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleEditSuccess = () => {
    showMessage('Prüfung erfolgreich aktualisiert!', 'success');
    setTimeout(() => history.replace(Routes.HOME), 1500);
  };

  const handleEditError = (message: string) => {
    showMessage(`Fehler: ${message}`, 'danger');
  };

  const handleAddGrade = () => {
    if (!exam) return;

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
                    {exam.name}
                  </IonCardTitle>
                  <IonCardSubtitle className={styles.headerCardSubtitle}>
                    <div className={styles.headerCardInfo}>
                      <div className={styles.headerCardInfoRow}>
                        <IonIcon icon={calendarOutline} />
                        {formatDate(exam.date)}
                      </div>
                      <div className={styles.headerCardInfoRow}>
                        <IonIcon icon={schoolOutline} />
                        {subjects.find((s) => s.id === exam.subjectId)?.name ||
                          'Unbekanntes Fach'}
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

            {segmentValue === 'details' && exam ? (
              <EditExamForm
                examId={examId}
                initialData={{
                  name: exam.name,
                  date: exam.date,
                  subjectId: exam.subjectId,
                  description: exam.description || '',
                }}
                subjects={subjects}
                onSuccess={handleEditSuccess}
                onError={handleEditError}
              />
            ) : (
              <GradeForm
                formValues={gradeForm.state.values as GradeFormData}
                onFieldChange={(field, value) =>
                  gradeForm.setFieldValue(field as keyof GradeFormData, value)
                }
                getGradeColor={getGradeColor}
                onSubmit={gradeForm.handleSubmit}
              />
            )}
          </div>

          <IonModal
            isOpen={showGradeConfirmModal}
            onDidDismiss={() => setShowGradeConfirmModal(false)}
            className={styles.modal}
          >
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <IonButton
                  className={styles.closeButton}
                  onClick={() => setShowGradeConfirmModal(false)}
                ></IonButton>
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
                    <div className={styles.infoValue}>{exam?.name}</div>
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
                  <IonButton
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
                  </IonButton>
                  <IonButton
                    className={styles.cancelButton}
                    onClick={() => setShowGradeConfirmModal(false)}
                  >
                    Abbrechen
                  </IonButton>
                </div>
              </div>
            </div>
          </IonModal>

          <IonAlert
            isOpen={showDeleteAlert}
            onDidDismiss={() => setShowDeleteAlert(false)}
            header="Prüfung löschen?"
            message={`Möchtest du die Prüfung "${exam?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
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

export default ExamDetailsPage;
