import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  IonContent,
  IonPage,
  IonToast,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  libraryOutline,
  documentTextOutline,
  calendarOutline,
  addOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import Header from '@/components/Header/Header';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import { School, Subject } from '@/db/entities';
import { format } from 'date-fns';
import { useSchools, useSchoolSubjects, useAddExam } from '@/hooks';
import { Routes } from '@/routes';
import '../grades/AddGradePage.css';

import TitleField from '@/components/Form/addForms/exams/ExamTitle';
import SelectedSchoolField from '@/components/Form/addForms/SelectedSchoolField';

interface ExamAddFormData {
  selectedSchoolId: string;
  selectedSubjectId: string;
  title: string;
  date: string;
  description: string;
}

const AddExamPage: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      selectedSchoolId: '',
      selectedSubjectId: '',
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    } as ExamAddFormData,
    onSubmit: async ({ value }) => {
      const examPayload = {
        schoolId: value.selectedSchoolId,
        subjectId: value.selectedSubjectId,
        title: value.title.trim(),
        date: new Date(value.date + 'T12:00:00'),
        description: value.description.trim(),
      };

      addExamMutation.mutate(examPayload, {
        onSuccess: () => {
          setShowSuccess(true);

          form.reset();
          setSelectedSchoolId('');
          form.setFieldValue('date', format(new Date(), 'yyyy-MM-dd'));

          setTimeout(() => history.push(Routes.HOME), 1200);
        },
        onError: (error) => {
          showAndSetToastMessage(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      });
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {};

        if (!value.selectedSchoolId) {
          errors.selectedSchoolId = 'Bitte wähle eine Schule aus!';
        }
        if (!value.selectedSubjectId) {
          errors.selectedSubjectId = 'Bitte wähle ein Fach aus!';
        }
        if (!value.title.trim()) {
          errors.title = 'Bitte gib einen Titel ein!';
        }
        if (!value.date) {
          errors.date = 'Bitte wähle ein Datum aus!';
        }

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          showAndSetToastMessage('Bitte fülle alle Pflichtfelder aus!');
          return Object.values(errors).join(', ');
        }

        setFieldErrors({});
        return undefined;
      },
    },
  });

  const { data: schools = [], error: schoolsError } = useSchools();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const { data: subjects = [], error: subjectsError } =
    useSchoolSubjects(selectedSchoolId);
  const addExamMutation = useAddExam();

  useEffect(() => {
    if (schoolsError) {
      showAndSetToastMessage('Fehler beim Laden der Schulen');
    }
    if (subjectsError) {
      showAndSetToastMessage('Fehler beim Laden der Fächer');
    }
  }, [schoolsError, subjectsError]);

  const handleSchoolChange = useCallback(
    (value: string | number | boolean) => {
      const newSchoolId = String(value);
      form.setFieldValue('selectedSchoolId', newSchoolId);
      form.setFieldValue('selectedSubjectId', '');
      setSelectedSchoolId(newSchoolId);
      setFieldErrors((prev) => ({
        ...prev,
        selectedSchoolId: '',
        selectedSubjectId: '',
      }));
    },
    [form],
  );

  const handleSubjectChange = useCallback(
    (value: string | number | boolean) => {
      const subjectId = String(value);
      form.setFieldValue('selectedSubjectId', subjectId);
      setFieldErrors((prev) => ({ ...prev, selectedSubjectId: '' }));
    },
    [form],
  );

  const showAndSetToastMessage = (
    message: string,
    color: 'success' | 'danger' = 'danger',
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const schoolOptions = useMemo(
    () =>
      schools.map((school: School) => ({
        value: school.id,
        label: school.name,
      })),
    [schools],
  );

  const subjectOptions = useMemo(
    () =>
      subjects.map((subject: Subject) => ({
        value: subject.id,
        label: subject.name,
      })),
    [subjects],
  );

  const formProgress = useMemo(() => {
    const values = form.state.values;
    const fields = ['selectedSchoolId', 'selectedSubjectId', 'title', 'date'];
    const completed = fields.filter((field) => {
      const value = values[field as keyof ExamAddFormData];
      return value !== '';
    }).length;
    return Math.round((completed / fields.length) * 100);
  }, [form.state.values]);

  const handleAddExam = () => {
    form.handleSubmit();
  };

  return (
    <IonPage className="add-exam-page">
      <Header
        title={'Prüfung hinzufügen'}
        backButton={true}
        onBack={() => window.history.back()}
      />
      <IonContent className="add-exam-content" scrollY={true}>
        <div className="content-wrapper">
          <div className="gradient-orb" />
          {showSuccess && (
            <div className="success-overlay">
              <div className="success-content">
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="success-icon"
                />
                <h3 className="success-title">Erfolgreich hinzugefügt!</h3>
                <p className="success-message">Die Prüfung wurde gespeichert</p>
              </div>
            </div>
          )}
          <div className="form-progress-container">
            <div
              className="form-progress"
              role="progressbar"
              aria-valuenow={formProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-bar"
                style={{ width: `${formProgress}%` }}
              />
            </div>
            <span className="progress-text">{formProgress}% completed</span>
          </div>
          <div className="form-group">
            <div className="form-card">
              <div className="form-fields">
                <form.Field name="selectedSchoolId">
                  {(field) => (
                    <SelectedSchoolField
                      field={field}
                      fieldErrors={fieldErrors}
                      setFieldErrors={setFieldErrors}
                      schoolOptions={schoolOptions}
                      handleSchoolChange={handleSchoolChange}
                    />
                  )}
                </form.Field>

                <form.Field name="selectedSubjectId">
                  {(field) => (
                    <div
                      className={`input-row ${fieldErrors.selectedSubjectId ? 'error' : ''}`}
                    >
                      <div className="field-icon-wrapper">
                        <IonIcon icon={libraryOutline} className="field-icon" />
                      </div>
                      <div className="field-content">
                        <label className="field-label" htmlFor="subject-select">
                          Fach *
                        </label>

                        <div className="select-input">
                          <IonSelect
                            id="subject-select"
                            className="form-input"
                            interface="popover"
                            placeholder={
                              !form.state.values.selectedSchoolId
                                ? 'Bitte zuerst Schule wählen'
                                : 'Fach auswählen'
                            }
                            value={field.state.value}
                            onIonChange={(e) =>
                              handleSubjectChange(e.detail.value)
                            }
                            disabled={
                              !form.state.values.selectedSchoolId ||
                              subjects.length === 0
                            }
                            aria-describedby={
                              fieldErrors.selectedSubjectId
                                ? 'subject-error'
                                : undefined
                            }
                          >
                            {subjectOptions.map((option) => (
                              <IonSelectOption
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </IonSelectOption>
                            ))}
                          </IonSelect>
                        </div>

                        <div className="message-area">
                          {fieldErrors.selectedSubjectId && (
                            <div
                              id="subject-error"
                              className="field-error"
                              role="alert"
                            >
                              {fieldErrors.selectedSubjectId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </form.Field>

                <form.Field name="title">
                  {(field) => (
                    <TitleField
                      field={field}
                      fieldErrors={fieldErrors}
                      setFieldErrors={setFieldErrors}
                    />
                  )}
                </form.Field>

                <form.Field name="date">
                  {(field) => (
                    <div
                      className={`input-row ${fieldErrors.date ? 'error' : ''}`}
                    >
                      <div className="field-icon-wrapper">
                        <IonIcon
                          icon={calendarOutline}
                          className="field-icon"
                        />
                      </div>
                      <div className="field-content">
                        <label className="field-label" htmlFor="exam-date">
                          Datum *
                        </label>
                        <IonInput
                          id="exam-date"
                          className="form-input"
                          type="date"
                          value={field.state.value}
                          onIonChange={(e) => {
                            const val = e.detail.value ?? '';
                            field.handleChange(val);
                            setFieldErrors((prev) => ({ ...prev, date: '' }));
                          }}
                          aria-describedby={
                            fieldErrors.date ? 'date-error' : undefined
                          }
                          required
                        />
                        <div className="message-area">
                          {fieldErrors.date && (
                            <div
                              id="date-error"
                              className="field-error"
                              role="alert"
                            >
                              {fieldErrors.date}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </form.Field>

                <form.Field name="description">
                  {(field) => (
                    <div className="input-row">
                      <div className="field-icon-wrapper">
                        <IonIcon
                          icon={documentTextOutline}
                          className="field-icon"
                        />
                      </div>
                      <div className="field-content">
                        <label
                          className="field-label"
                          htmlFor="exam-description"
                        >
                          Beschreibung (optional)
                        </label>
                        <IonInput
                          id="exam-description"
                          className="form-input"
                          type="text"
                          value={field.state.value}
                          onIonChange={(e) =>
                            field.handleChange(e.detail.value ?? '')
                          }
                          placeholder="Zusätzliche Notizen..."
                        />
                      </div>
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <div className="button-section">
            <button
              className="glass-button primary"
              onClick={handleAddExam}
              disabled={addExamMutation.isPending}
            >
              <IonIcon icon={addOutline} className="button-icon" />
              <span className="button-text">
                {addExamMutation.isPending
                  ? 'Wird hinzugefügt...'
                  : 'Prüfung hinzufügen'}
              </span>
            </button>
          </div>

          <div className="bottom-spacer" />
        </div>

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={toastColor === 'success' ? 3000 : 2000}
          color={toastColor}
        />
      </IonContent>

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </IonPage>
  );
};

export default AddExamPage;
