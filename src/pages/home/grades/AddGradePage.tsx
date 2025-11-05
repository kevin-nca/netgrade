import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonToast,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';

import { useForm } from '@tanstack/react-form';
import { useHistory } from 'react-router-dom';
import {
  schoolOutline,
  libraryOutline,
  documentTextOutline,
  calendarOutline,
  scaleOutline,
  ribbonOutline,
  addOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import Header from '@/components/Header/Header';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import { School, Subject } from '@/db/entities';
import { format, parseISO } from 'date-fns';
import {
  useSchools,
  useSchoolSubjects,
  useAddGradeWithExam,
} from '@/hooks/queries';
import {
  validateGrade,
  validateWeight,
  percentageToDecimal,
} from '@/utils/validation';
import { Routes } from '@/routes';
import './AddGradePage.css';

import type {
  IonInputCustomEvent,
  InputInputEventDetail,
} from '@ionic/core/components';

interface GradeAddFormData {
  selectedSchoolId: string;
  selectedSubjectId: string;
  examName: string;
  date: string; // Store as ISO string e.g., "YYYY-MM-DD"
  weight: string;
  score: string;
  comment: string;
}

const AddGradePage: React.FC = () => {
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
      examName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: '',
      score: '',
      comment: '',
    } as GradeAddFormData,
    onSubmit: async ({ value }) => {
      const scoreNumber = +String(value.score).replace(',', '.');
      const weightNumber = +String(value.weight).replace(',', '.');

      const gradeError = validateGrade(scoreNumber);
      if (gradeError) {
        setFieldErrors((prev) => ({ ...prev, score: gradeError }));
        return;
      }

      const weightError = validateWeight(weightNumber);
      if (weightError) {
        setFieldErrors((prev) => ({ ...prev, weight: weightError }));
        return;
      }
      setFieldErrors({});

      const gradePayload = {
        subjectId: value.selectedSubjectId,
        examName: value.examName.trim(),
        date: parseISO(value.date),
        score: scoreNumber,
        weight: percentageToDecimal(weightNumber),
      };

      addGradeWithExamMutation.mutate(gradePayload, {
        onSuccess: () => {
          setShowSuccess(true);
          form.reset();

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
        if (!value.examName.trim()) {
          errors.examName = 'Bitte gib einen Prüfungsnamen ein!';
        }
        if (!String(value.weight ?? '').trim()) {
          errors.weight = 'Bitte gib eine Gewichtung ein!';
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

  useEffect(() => {
    if (schoolsError) {
      showAndSetToastMessage('Fehler beim Laden der Schulen');
    }
    if (subjectsError) {
      showAndSetToastMessage('Fehler beim Laden der Fächer');
    }
  }, [schoolsError, subjectsError]);

  const handleSubjectChange = useCallback(
    (value: string | number | boolean) => {
      const subjectId = String(value);
      form.setFieldValue('selectedSubjectId', subjectId);
      setFieldErrors((prev) => ({ ...prev, selectedSubjectId: '' }));
    },
    [form],
  );

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

  const showAndSetToastMessage = (
    message: string,
    color: 'success' | 'danger' = 'danger',
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const validateField = useCallback(
    (fieldName: string, value: string | number) => {
      setTimeout(() => {
        let error = '';
        let suggestion = '';

        switch (fieldName) {
          case 'score': {
            const stringValue = String(value);
            const scoreNum = Number(value);
            if (stringValue.endsWith('.') || stringValue === '') {
              error = '';
              suggestion = '';
            } else if (isNaN(scoreNum)) {
              error = 'Bitte eine gültige Zahl eingeben.';
              suggestion = '';
            } else {
              error = validateGrade(scoreNum) || '';
              if (!error && scoreNum > 0) {
                if (scoreNum >= 5.5)
                  suggestion = '💡 Ausgezeichnet! Eine sehr gute Note.';
                else if (scoreNum >= 4.5) suggestion = '✨ Gute Leistung!';
                else if (scoreNum >= 3.5) suggestion = '👍 Solide Note.';
                else if (scoreNum >= 2.5)
                  suggestion = '📚 Noch Verbesserungspotential.';
                else suggestion = '🎯 Beim nächsten Mal wird es besser!';
              }
            }
            break;
          }
          case 'weight': {
            const weightNum = Number(value);
            error = validateWeight(weightNum) || '';
            break;
          }
          case 'examName': {
            const examName = String(value).trim();
            error = !examName ? 'Prüfungsname ist erforderlich' : '';
            if (!error && examName.length >= 7) {
              suggestion = '📝 Ausführlicher Prüfungsname';
            }
            break;
          }
        }

        setFieldErrors((prev) => ({
          ...prev,
          [fieldName]: error,
          [`${fieldName}_suggestion`]: suggestion,
        }));
      }, 300);
    },
    [],
  );

  const handleExamNameInput = (
    e: IonInputCustomEvent<InputInputEventDetail>,
  ) => {
    const value = e.detail.value ?? '';
    form.setFieldValue('examName', value);
    validateField('examName', value);
  };

  const handleWeightInput = (e: IonInputCustomEvent<InputInputEventDetail>) => {
    const value = e.detail.value ?? '';
    form.setFieldValue('weight', value);
    validateField('weight', value);
  };

  const handleScoreInput = (e: IonInputCustomEvent<InputInputEventDetail>) => {
    const value = e.detail.value ?? '';
    form.setFieldValue('score', value);
    validateField('score', value);
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
    const fields: (keyof GradeAddFormData)[] = [
      'selectedSchoolId',
      'selectedSubjectId',
      'examName',
      'date',
      'weight',
      'score',
    ];
    const completed = fields.filter((field) => {
      const value = values[field];
      return value !== '' && value !== null && value !== '';
    }).length;
    return Math.round((completed / fields.length) * 100);
  }, [form.state.values]);

  const addGradeWithExamMutation = useAddGradeWithExam();

  const handleAddGrade = () => {
    form.handleSubmit();
  };

  return (
    <IonPage className="add-grade-page">
      <Header
        title={'Note hinzufügen'}
        backButton={true}
        onBack={() => window.history.back()}
      />
      <IonContent className="add-grade-content" scrollY={true}>
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
                <p className="success-message">Die Note wurde gespeichert</p>
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
                    <div
                      className={`input-row ${fieldErrors.selectedSchoolId ? 'error' : ''}`}
                    >
                      <div className="field-icon-wrapper">
                        <IonIcon icon={schoolOutline} className="field-icon" />
                      </div>
                      <div className="field-content">
                        <label className="field-label" htmlFor="school-select">
                          Schule *
                        </label>
                        <IonSelect
                          id="school-select"
                          className="form-input"
                          interface="popover"
                          placeholder="Schule auswählen"
                          value={field.state.value}
                          onIonChange={(e) =>
                            handleSchoolChange(e.detail.value)
                          }
                          aria-describedby={
                            fieldErrors.selectedSchoolId
                              ? 'school-error'
                              : undefined
                          }
                        >
                          {schoolOptions.map((option) => (
                            <IonSelectOption
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                        <div className="message-area">
                          {fieldErrors.selectedSchoolId && (
                            <div
                              id="school-error"
                              className="field-error"
                              role="alert"
                            >
                              {fieldErrors.selectedSchoolId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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

                <form.Field name="examName">
                  {(field) => (
                    <div
                      className={`input-row ${fieldErrors.examName ? 'error' : ''}`}
                    >
                      <div className="field-icon-wrapper">
                        <IonIcon
                          icon={documentTextOutline}
                          className="field-icon"
                        />
                      </div>
                      <div className="field-content">
                        <label className="field-label" htmlFor="exam-name">
                          Prüfungsname *
                        </label>
                        <IonInput
                          id="exam-name"
                          className="form-input"
                          type="text"
                          enterKeyHint="done"
                          value={String(field.state.value ?? '')}
                          onIonInput={handleExamNameInput}
                          onIonBlur={field.handleBlur}
                          placeholder="z.B. Klausur 1, Vokabeltest"
                          aria-describedby={
                            fieldErrors.examName ? 'exam-name-error' : undefined
                          }
                          required
                        />
                        <div className="message-area">
                          {fieldErrors.examName && (
                            <div
                              id="exam-name-error"
                              className="field-error"
                              role="alert"
                            >
                              {fieldErrors.examName}
                            </div>
                          )}
                          {fieldErrors.examName_suggestion &&
                            !fieldErrors.examName && (
                              <div className="field-suggestion">
                                {fieldErrors.examName_suggestion}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
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

                <form.Field name="weight">
                  {(field) => (
                    <div
                      className={`input-row ${fieldErrors.weight ? 'error' : ''}`}
                    >
                      <div className="field-icon-wrapper">
                        <IonIcon icon={scaleOutline} className="field-icon" />
                      </div>
                      <div className="field-content">
                        <label className="field-label" htmlFor="weight">
                          Gewichtung (0-100%)
                        </label>
                        <div className="weight-input-container">
                          <IonInput
                            id="weight"
                            className="form-input weight-input"
                            type="text"
                            inputmode="decimal"
                            min="0"
                            max="100"
                            step="0.01"
                            value={String(field.state.value ?? '')}
                            onIonInput={handleWeightInput}
                            onIonBlur={field.handleBlur}
                            required
                            placeholder="100"
                          />
                          <div className="weight-quick-actions">
                            <button
                              type="button"
                              className="weight-preset-btn"
                              onClick={() => {
                                form.setFieldValue('weight', '25');
                                validateField('weight', '25');
                              }}
                              tabIndex={-1}
                            >
                              25%
                            </button>
                            <button
                              type="button"
                              className="weight-preset-btn"
                              onClick={() => {
                                form.setFieldValue('weight', '50');
                                validateField('weight', '50');
                              }}
                              tabIndex={-1}
                            >
                              50%
                            </button>
                            <button
                              type="button"
                              className="weight-preset-btn"
                              onClick={() => {
                                form.setFieldValue('weight', '100');
                                validateField('weight', '100');
                              }}
                              tabIndex={-1}
                            >
                              100%
                            </button>
                          </div>
                        </div>
                        <div className="message-area">
                          {fieldErrors.weight && (
                            <div
                              id="weight-error"
                              className="field-error"
                              role="alert"
                            >
                              {fieldErrors.weight}
                            </div>
                          )}
                          {fieldErrors.weight_suggestion &&
                            !fieldErrors.weight && (
                              <div className="field-suggestion">
                                {fieldErrors.weight_suggestion}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </form.Field>

                <form.Field name="score">
                  {(field) => (
                    <div
                      className={`input-row ${fieldErrors.score ? 'error' : ''}`}
                    >
                      <div className="field-icon-wrapper">
                        <IonIcon icon={ribbonOutline} className="field-icon" />
                      </div>
                      <div className="field-content">
                        <label className="field-label" htmlFor="score">
                          Note (1-6) *
                        </label>
                        <IonInput
                          id="score"
                          className="form-input"
                          type="text"
                          inputmode="decimal"
                          min="1"
                          max="6"
                          step="0.01"
                          value={String(field.state.value ?? '')}
                          onIonInput={handleScoreInput}
                          onIonBlur={field.handleBlur}
                          placeholder="6.0"
                          aria-describedby={
                            fieldErrors.score ? 'score-error' : undefined
                          }
                          required
                        />
                        <div className="message-area">
                          {fieldErrors.score && (
                            <div
                              id="score-error"
                              className="field-error"
                              role="alert"
                            >
                              {fieldErrors.score}
                            </div>
                          )}
                          {fieldErrors.score_suggestion &&
                            !fieldErrors.score && (
                              <div className="field-suggestion">
                                {fieldErrors.score_suggestion}
                              </div>
                            )}
                        </div>
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
              onClick={handleAddGrade}
              disabled={addGradeWithExamMutation.isPending}
            >
              <IonIcon icon={addOutline} className="button-icon" />
              <span className="button-text">
                {addGradeWithExamMutation.isPending
                  ? 'Wird hinzugefügt...'
                  : 'Note hinzufügen'}
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

export default AddGradePage;
