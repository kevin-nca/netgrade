import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  schoolOutline,
  bookOutline,
  documentTextOutline,
  calendarOutline,
  saveOutline,
} from 'ionicons/icons';
import {
  GlassForm,
  GlassFormSection,
  GlassInput,
  GlassSelect,
  GlassDatePicker,
  GlassButton,
} from '@/components/GlassForm';
import Header from '@/components/Header/Header';
import { Subject } from '@/db/entities';
import { useSchools, useSubjects, useAddExam } from '@/hooks';
import { Routes } from '@/routes';

interface ExamFormData {
  selectedSchool: string;
  selectedSubject: string;
  title: string;
  date: Date | string;
  description: string;
}

const AddExamPage: React.FC = () => {
  const history = useHistory();

  const [formData, setFormData] = useState<ExamFormData>({
    selectedSchool: '',
    selectedSubject: '',
    title: '',
    date: '',
    description: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ExamFormData, string>>
  >({});

  const { data: schools = [] } = useSchools();
  const { data: subjects = [] } = useSubjects();
  const { mutate: addExam, isPending } = useAddExam();

  const handleFieldChange = <K extends keyof ExamFormData>(
    field: K,
    value: ExamFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user changes field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Reset subject when school changes
    if (field === 'selectedSchool') {
      setFormData((prev) => ({ ...prev, selectedSubject: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExamFormData, string>> = {};

    if (!formData.selectedSchool) {
      newErrors.selectedSchool = 'Bitte wähle eine Schule aus';
    }
    if (!formData.selectedSubject) {
      newErrors.selectedSubject = 'Bitte wähle ein Fach aus';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Bitte gib einen Titel ein';
    }
    if (!formData.date) {
      newErrors.date = 'Bitte wähle ein Datum aus';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const newExam = {
      schoolId: formData.selectedSchool,
      subjectId: formData.selectedSubject,
      title: formData.title.trim(),
      date: new Date(formData.date),
      description: formData.description.trim(),
    };

    addExam(newExam, {
      onSuccess: () => {
        history.push(Routes.HOME);
      },
      onError: (error) => {
        console.error('Failed to add exam:', error);
      },
    });
  };

  // Convert data to select options
  const schoolOptions = schools.map((school) => ({
    value: school.id,
    label: school.name,
  }));

  const filteredSubjects = subjects.filter(
    (subject: Subject) =>
      !formData.selectedSchool || subject.schoolId === formData.selectedSchool,
  );

  const subjectOptions = filteredSubjects.map((subject: Subject) => ({
    value: subject.id,
    label: subject.name,
  }));

  return (
    <IonPage>
      <Header
        title="Prüfung hinzufügen"
        backButton={true}
        defaultHref={Routes.HOME}
      />
      <IonContent>
        <div style={{ padding: '20px' }}>
          <GlassForm onSubmit={handleSubmit}>
            <GlassFormSection
              title="Schule & Fach"
              subtitle="Wähle die entsprechende Zuordnung"
              icon={schoolOutline}
            >
              <GlassSelect
                label="Schule"
                value={formData.selectedSchool}
                onChange={(value) =>
                  handleFieldChange('selectedSchool', String(value))
                }
                options={schoolOptions}
                placeholder="Wähle eine Schule"
                icon={schoolOutline}
                required
                error={errors.selectedSchool}
              />

              <GlassSelect
                label="Fach"
                value={formData.selectedSubject}
                onChange={(value) =>
                  handleFieldChange('selectedSubject', String(value))
                }
                options={subjectOptions}
                placeholder={
                  !formData.selectedSchool
                    ? 'Bitte zuerst Schule wählen'
                    : 'Wähle ein Fach'
                }
                icon={bookOutline}
                required
                error={errors.selectedSubject}
                disabled={!formData.selectedSchool}
              />
            </GlassFormSection>

            {/* Exam Details */}
            <GlassFormSection
              title="Prüfungsdetails"
              subtitle="Informationen zur Prüfung"
              icon={documentTextOutline}
            >
              <GlassInput
                label="Prüfungstitel"
                value={formData.title}
                onChange={(value) => handleFieldChange('title', String(value))}
                placeholder="z.B. Mathematik Klausur"
                icon={documentTextOutline}
                required
                error={errors.title}
                clearable
              />

              <GlassDatePicker
                label="Prüfungsdatum"
                value={formData.date}
                onChange={(value) => handleFieldChange('date', value)}
                icon={calendarOutline}
                required
                error={errors.date}
                min={new Date().toISOString().split('T')[0]}
              />

              <GlassInput
                label="Beschreibung"
                value={formData.description}
                onChange={(value) =>
                  handleFieldChange('description', String(value))
                }
                icon={documentTextOutline}
                placeholder="Optionale Beschreibung"
                maxLength={500}
              />
            </GlassFormSection>

            {/* Submit Button */}
            <GlassButton
              variant="primary"
              onClick={handleSubmit}
              loading={isPending}
              icon={saveOutline}
              fullWidth
            >
              {isPending ? 'Wird hinzugefügt...' : 'Prüfung hinzufügen'}
            </GlassButton>
          </GlassForm>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AddExamPage;
