import React, { useEffect } from 'react';
import { IonButton, IonCard, IonIcon, IonSpinner } from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import { z } from 'zod';
import { useAppForm } from '@/components/Form2/form';
import { Subject } from '@/db/entities';
import { useUpdateExam } from '@/hooks';
import styles from '../styles/FormCommon.module.css';

const editExamSchema = z.object({
  title: z.string().min(1, 'Bitte gib einen Titel ein'),
  date: z.string().min(1, 'Bitte wähle ein Datum aus'),
  subject: z.string().min(1, 'Bitte wähle ein Fach aus'),
  description: z.string(),
});

type EditExamFormData = z.infer<typeof editExamSchema>;

interface EditExamFormProps {
  examId: string;
  initialData: {
    name: string;
    date: Date;
    subjectId: string;
    description: string;
  };
  subjects: Subject[];
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function EditExamForm({
  examId,
  initialData,
  subjects,
  onSuccess,
  onError,
}: EditExamFormProps) {
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
          onSuccess();
        },
        onError: (error: Error) => {
          onError(error.message);
        },
      });
    },
  });

  useEffect(() => {
    if (initialData) {
      form.setFieldValue('title', initialData.name);
      form.setFieldValue('date', initialData.date.toISOString().split('T')[0]);
      form.setFieldValue('subject', initialData.subjectId);
      form.setFieldValue('description', initialData.description || '');
    }
  }, [initialData, form]);

  const handleSubmit = () => {
    form.handleSubmit();
  };

  return (
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
  );
}
