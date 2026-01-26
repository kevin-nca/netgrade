import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonButton,
  IonCard,
  IonIcon,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import { useAppForm } from '@/shared/components/form';
import { useExam, useSubjects, useUpdateExam } from '@/hooks';
import styles from '../../../pages/home/exams/EditExamPage/styles/FormCommon.module.css';
import {
  editExamSchema,
  type EditExamFormData,
} from '@/features/edit-exam/schema/editExamSchema';

interface EditExamFormProps {
  onSuccess?: () => void;
}

export function EditExamForm({ onSuccess }: EditExamFormProps) {
  const { examId } = useParams<{ examId: string }>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  const { data: exam } = useExam(examId);
  const { data: subjects = [] } = useSubjects();
  const updateExamMutation = useUpdateExam();

  const form = useAppForm({
    defaultValues: {
      title: '',
      date: '',
      subject: '',
      description: '',
    } as EditExamFormData,
    validators: {
      onSubmit: editExamSchema,
    },
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
          setToastMessage('Prüfung erfolgreich aktualisiert!');
          setToastColor('success');
          setShowToast(true);
          setTimeout(() => {
            onSuccess?.();
          }, 1500);
        },
        onError: (error: Error) => {
          setToastMessage(`Fehler: ${error.message}`);
          setToastColor('danger');
          setShowToast(true);
        },
      });
    },
  });

  useEffect(() => {
    if (exam) {
      form.setFieldValue('title', exam.name);
      form.setFieldValue('date', exam.date.toISOString().split('T')[0]);
      form.setFieldValue('subject', exam.subjectId);
      form.setFieldValue('description', exam.description || '');
    }
  }, [exam, form]);

  const handleSubmit = () => {
    form.handleSubmit();
  };

  return (
    <>
      <IonCard className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <h2 className={styles.formCardTitle}>Prüfungsdetails bearbeiten</h2>
        </div>

        <div className={styles.formCardContent}>
          <form.AppField name="title">
            {(field) => <field.EditExamNameField label="Prüfungsname" />}
          </form.AppField>

          <form.AppField name="date">
            {(field) => <field.DateField label="Prüfungsdatum" />}
          </form.AppField>

          <form.AppField name="subject">
            {(field) => (
              <field.EditExamSubjectSelectField
                label="Fach"
                subjects={subjects}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.DescriptionField label="Beschreibung (optional)" />
            )}
          </form.AppField>
        </div>

        <div className={styles.formCardFooter}>
          <IonButton
            expand="block"
            className={styles.formButton}
            onClick={handleSubmit}
            disabled={updateExamMutation.isPending}
          >
            {updateExamMutation.isPending ? (
              <div className={styles.buttonContent}>
                <IonSpinner name="crescent" className={styles.spinner} />
                Wird gespeichert...
              </div>
            ) : (
              <div className={styles.buttonContentSave}>
                <IonIcon icon={saveOutline} className={styles.saveIcon} />
                Änderungen speichern
              </div>
            )}
          </IonButton>
        </div>
      </IonCard>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={toastColor === 'success' ? 3000 : 2000}
        color={toastColor}
      />
    </>
  );
}
