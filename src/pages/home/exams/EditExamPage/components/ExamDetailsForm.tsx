// src/pages/home/exams/EditExamPage/components/ExamDetailsForm.tsx
import React from 'react';
import {
  documentTextOutline,
  calendarOutline,
  schoolOutline,
  saveOutline,
} from 'ionicons/icons';
import {
  GlassForm,
  GlassFormSection,
  GlassInput,
  GlassSelect,
  GlassTextarea,
  GlassDatePicker,
  GlassButton,
} from '@/components/GlassForm';
import { Subject } from '@/db/entities';
import { ExamFormData } from '../types';

interface ExamDetailsFormProps {
  formValues: ExamFormData;
  onFieldChange: <K extends keyof ExamFormData>(
    field: K,
    value: ExamFormData[K],
  ) => void;
  subjects: Subject[];
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const ExamDetailsForm: React.FC<ExamDetailsFormProps> = ({
  formValues,
  onFieldChange,
  subjects,
  isSubmitting,
  onSubmit,
}) => {
  // Convert subjects to select options
  const subjectOptions = subjects.map((subject) => ({
    value: subject.id,
    label: subject.name,
  }));

  return (
    <div style={{ padding: '16px' }}>
      <GlassForm onSubmit={onSubmit}>
        <GlassFormSection
          title="Prüfungsdetails bearbeiten"
          subtitle="Grundlegende Informationen der Prüfung"
          icon={documentTextOutline}
        >
          <GlassInput
            label="Titel der Prüfung"
            value={formValues.title}
            onChange={(value) => onFieldChange('title', String(value))}
            placeholder="Prüfungstitel"
            icon={documentTextOutline}
            required
            clearable
          />

          <GlassDatePicker
            label="Prüfungsdatum"
            value={formValues.date}
            onChange={(value) => onFieldChange('date', String(value))}
            icon={calendarOutline}
            required
          />

          <GlassSelect
            label="Fach"
            value={formValues.subject}
            onChange={(value) => onFieldChange('subject', String(value))}
            options={subjectOptions}
            placeholder="Fach wählen"
            icon={schoolOutline}
            required
          />

          <GlassTextarea
            label="Beschreibung (optional)"
            value={formValues.description}
            onChange={(value) => onFieldChange('description', String(value))}
            placeholder="Notizen zur Prüfung..."
            icon={documentTextOutline}
            rows={3}
            maxLength={500}
            autoGrow
          />
        </GlassFormSection>

        <GlassButton
          variant="primary"
          onClick={onSubmit}
          loading={isSubmitting}
          icon={saveOutline}
          fullWidth
        >
          {isSubmitting ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </GlassButton>
      </GlassForm>
    </div>
  );
};
