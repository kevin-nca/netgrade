import React, { useState } from 'react';
import {
  IonContent,
  IonList,
  IonModal,
  IonPage,
  IonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import {
  documentTextOutline,
  calendarOutline,
  trophyOutline,
  scaleOutline,
  chatbubbleOutline,
  saveOutline,
  close,
  createOutline,
} from 'ionicons/icons';
import {
  GlassForm,
  GlassFormSection,
  GlassInput,
  GlassDatePicker,
  GlassTextarea,
  GlassButton,
} from '@/components/GlassForm';
import Header from '@/components/Header/Header';
import GradeListItem from '@/components/List/GradeListItem';
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
  const deleteGradeMutation = useDeleteGrade();
  const updateExamAndGradeMutation = useUpdateExamAndGrade();
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
    validators: {
      onChange: ({ value }) => {
        if (value.examName && value.examName.trim().length < 2) {
          return 'Prüfungsname muss mindestens 2 Zeichen haben';
        }
        return undefined;
      },
    },
  });

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

    const grade = grades.find((grade: Grade) => grade.id === editingId);
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
    gradeForm.reset();
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
            <div style={{ padding: '20px', paddingBottom: '92px' }}>
              <GlassForm>
                <GlassFormSection
                  title="Deine Noten"
                  subtitle="Alle eingetragenen Noten im Überblick"
                  icon={trophyOutline}
                  contentSpacing={28}
                >
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
                </GlassFormSection>
              </GlassForm>
            </div>
          )}
          <IonModal
            isOpen={editingId !== null}
            onDidDismiss={cancelEdit}
            className="settings-modal"
            breakpoints={[0, 0.25, 0.5, 0.75, 1]}
            initialBreakpoint={0.9}
            backdropBreakpoint={0.5}
          >
            <IonPage className="modal-page">
              <IonHeader className="modal-header">
                <IonToolbar className="modal-toolbar">
                  <IonButtons slot="start">
                    <IonButton
                      onClick={cancelEdit}
                      fill="clear"
                      className="modal-close-button"
                    >
                      <IonIcon
                        icon={close}
                        slot="icon-only"
                        className="modal-close-icon"
                      />
                    </IonButton>
                  </IonButtons>
                  <IonTitle className="modal-title">Note bearbeiten</IonTitle>
                  <IonButtons slot="end">
                    <IonButton fill="clear" className="modal-dummy-button">
                      <IonIcon
                        icon={close}
                        slot="icon-only"
                        className="modal-close-icon"
                      />
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>

              <IonContent className="modal-content" scrollY={true}>
                <div className="modal-content-wrapper">
                  <div className="modal-header-section">
                    <div className="modal-gradient-orb" />
                    <div className="modal-header-content">
                      <div className="modal-header-flex">
                        <div className="modal-icon-wrapper">
                          <IonIcon
                            icon={createOutline}
                            className="modal-icon"
                          />
                        </div>
                        <div className="modal-text">
                          <h1>Note bearbeiten</h1>
                          <p>Ändere die Details deiner Note</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingBottom: '92px' }}>
                    <GlassForm onSubmit={gradeForm.handleSubmit}>
                      <GlassFormSection
                        title="Prüfungsdetails"
                        subtitle="Informationen zur Prüfung"
                        icon={documentTextOutline}
                      >
                        <gradeForm.Field name="examName">
                          {(field) => (
                            <GlassInput
                              label="Prüfungsname"
                              value={field.state.value}
                              onChange={(value) =>
                                field.handleChange(String(value))
                              }
                              placeholder="Titel der Prüfung"
                              icon={documentTextOutline}
                              required
                              error={field.state.meta.errors?.[0]}
                              clearable
                            />
                          )}
                        </gradeForm.Field>

                        <gradeForm.Field name="date">
                          {(field) => (
                            <GlassDatePicker
                              label="Datum"
                              value={field.state.value}
                              onChange={(value) =>
                                field.handleChange(String(value))
                              }
                              icon={calendarOutline}
                              required
                              error={field.state.meta.errors?.[0]}
                            />
                          )}
                        </gradeForm.Field>
                      </GlassFormSection>
                      <GlassFormSection
                        title="Bewertung"
                        subtitle="Note und Gewichtung anpassen"
                        icon={trophyOutline}
                      >
                        <gradeForm.Field name="score">
                          {(field) => (
                            <GlassInput
                              label="Note (1 bis 6)"
                              value={field.state.value}
                              onChange={(value) =>
                                field.handleChange(Number(value))
                              }
                              variant="number"
                              icon={trophyOutline}
                              required
                              error={field.state.meta.errors?.[0]}
                              min={1}
                              max={6}
                              step={0.1}
                            />
                          )}
                        </gradeForm.Field>

                        <gradeForm.Field name="weight">
                          {(field) => (
                            <GlassInput
                              label="Gewichtung (0 bis 100%)"
                              value={field.state.value}
                              onChange={(value) =>
                                field.handleChange(Number(value))
                              }
                              variant="number"
                              icon={scaleOutline}
                              required
                              error={field.state.meta.errors?.[0]}
                              min={0}
                              max={100}
                              step={1}
                            />
                          )}
                        </gradeForm.Field>

                        <gradeForm.Field name="comment">
                          {(field) => (
                            <GlassTextarea
                              label="Kommentar (optional)"
                              value={field.state.value}
                              onChange={(value) => field.handleChange(value)}
                              placeholder="Zusätzliche Notizen..."
                              icon={chatbubbleOutline}
                              maxLength={500}
                              autoGrow
                              error={field.state.meta.errors?.[0]}
                            />
                          )}
                        </gradeForm.Field>
                      </GlassFormSection>
                    </GlassForm>
                  </div>
                  <div className="sticky-bottom-button">
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        width: '100%',
                      }}
                    >
                      <GlassButton
                        variant="secondary"
                        onClick={cancelEdit}
                        disabled={updateExamAndGradeMutation.isPending}
                      >
                        Abbrechen
                      </GlassButton>
                      <GlassButton
                        variant="primary"
                        onClick={gradeForm.handleSubmit}
                        loading={updateExamAndGradeMutation.isPending}
                        icon={saveOutline}
                      >
                        {updateExamAndGradeMutation.isPending
                          ? 'Wird gespeichert...'
                          : 'Änderungen speichern'}
                      </GlassButton>
                    </div>
                  </div>

                  <div className="modal-bottom-spacer" />
                </div>
              </IonContent>
            </IonPage>
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
