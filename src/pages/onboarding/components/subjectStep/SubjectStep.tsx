// src/pages/onboarding/components/subjectStep/SubjectStep.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { IonButton, IonIcon, IonInput, IonItem } from '@ionic/react';
import {
  bookOutline,
  addOutline,
  trashOutline,
  personOutline,
  checkmarkCircleOutline,
  arrowForward,
  calendarOutline,
} from 'ionicons/icons';
import {
  OnboardingDataTemp,
  TempSchool,
  TempSubject,
  TempSemester,
} from '../../types';
import './SubjectStep.css';

interface SubjectStepProps {
  data: OnboardingDataTemp;
  setData: React.Dispatch<React.SetStateAction<OnboardingDataTemp>>;
  selectedSemesterId: string;
  setSelectedSemesterId: React.Dispatch<React.SetStateAction<string>>;
  selectedSchoolId: string;
  setSelectedSchoolId: React.Dispatch<React.SetStateAction<string>>;
  generateId: () => string;
  onNext: () => void;
}

const SubjectStep: React.FC<SubjectStepProps> = ({
  data,
  setData,
  selectedSemesterId,
  setSelectedSemesterId,
  selectedSchoolId,
  setSelectedSchoolId,
  generateId,
  onNext,
}) => {
  const [selectedSchool, setSelectedSchool] = useState<TempSchool | null>(
    data.schools.find((s) => s.id === selectedSchoolId) ||
      data.schools[0] ||
      null,
  );
  const [selectedSemester, setSelectedSemester] = useState<TempSemester | null>(
    data.semesters.find((s) => s.id === selectedSemesterId) ||
      data.semesters[0] ||
      null,
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      teacher: '',
      description: '',
      weight: 100,
    },
    onSubmit: async ({ value }) => {
      if (selectedSchool && selectedSemester) {
        const subject: TempSubject = {
          id: generateId(),
          name: value.name.trim(),
          teacher: value.teacher?.trim() || null,
          description: value.description?.trim() || null,
          weight: 100,
          schoolId: selectedSchool.id,
          semesterId: selectedSemester.id,
        };

        setData((prev) => ({
          ...prev,
          subjects: [...prev.subjects, subject],
        }));

        form.reset();
        form.setFieldValue('weight', 100);
        setShowAddForm(false);
      }
    },
  });

  useEffect(() => {
    if (selectedSchool) {
      setSelectedSchoolId(selectedSchool.id);
    }
  }, [selectedSchool, setSelectedSchoolId]);

  useEffect(() => {
    if (selectedSemester) {
      setSelectedSemesterId(selectedSemester.id);
    }
  }, [selectedSemester, setSelectedSemesterId]);

  const handleAddSubject = () => {
    form.handleSubmit();
  };

  const handleRemoveSubject = (subjectId: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
    }));
  };

  const currentSchoolSubjects = data.subjects.filter(
    (s) =>
      s.schoolId === selectedSchool?.id &&
      s.semesterId === selectedSemester?.id,
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <div className="gradient-orb" />
        <div className="step-content">
          <div className="step-icon-wrapper">
            <IonIcon icon={bookOutline} className="step-icon" />
          </div>
          <div className="step-text">
            <h1 className="step-title">Fächer hinzufügen</h1>
            <p className="step-subtitle">
              Erstelle Fächer für {selectedSchool!.name} -{' '}
              {selectedSemester!.name}
            </p>
          </div>
        </div>
      </div>

      <div className="step-body">
        {/* Semester Selector */}
        {data.semesters.length > 1 && (
          <div className="semester-selector">
            <h3 className="subsection-title">Semester auswählen</h3>
            <div className="semesters-grid">
              {data.semesters.map((semester, index) => (
                <div
                  key={semester.id}
                  className={`glass-card semester-selector-item ${semester.id === selectedSemester!.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSemester(semester)}
                >
                  <div className={`semester-avatar semester-${index % 4}`}>
                    <IonIcon icon={calendarOutline} />
                  </div>
                  <div className="semester-selector-info">
                    <span className="semester-selector-name">
                      {semester.name}
                    </span>
                    <span className="semester-selector-dates">
                      {formatDate(semester.startDate)} -{' '}
                      {formatDate(semester.endDate)}
                    </span>
                  </div>
                  {semester.id === selectedSemester!.id && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="selected-icon"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* School Selector */}
        {data.schools.length > 1 && (
          <div className="school-selector">
            <h3 className="subsection-title">Schule auswählen</h3>
            <div className="schools-grid">
              {data.schools.map((school, index) => (
                <div
                  key={school.id}
                  className={`glass-card school-selector-item ${school.id === selectedSchool!.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSchool(school)}
                >
                  <div className={`school-avatar school-${index % 4}`}>
                    {school.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="school-selector-name">{school.name}</span>
                  {school.id === selectedSchool!.id && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="selected-icon"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Subject Form */}
        <div className="add-section">
          {currentSchoolSubjects.length < 2 &&
            (!showAddForm ? (
              <div className="glass-card add-prompt">
                <div
                  className="add-content"
                  onClick={() => setShowAddForm(true)}
                >
                  <div className="add-icon-wrapper">
                    <IonIcon icon={addOutline} className="add-icon" />
                  </div>
                  <div className="add-text">
                    <h4>Fach hinzufügen</h4>
                    <p>Tippe hier, um ein neues Fach zu erstellen</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card add-form">
                <div className="form-content">
                  <h3 className="form-title">Neues Fach erstellen</h3>

                  <div className="form-fields">
                    <form.Field name="name">
                      {(field) => (
                        <div className="field-group">
                          <label className="field-label">Fachname *</label>
                          <div className="input-wrapper glass-input">
                            <IonItem lines="none" className="input-item">
                              <div slot="start" className="input-icon-wrapper">
                                <IonIcon
                                  icon={bookOutline}
                                  className="input-icon"
                                />
                              </div>
                              <IonInput
                                value={field.state.value}
                                placeholder="z.B. Mathematik"
                                onIonInput={(e) =>
                                  field.handleChange(e.detail.value || '')
                                }
                                className="input-field"
                                clearInput
                              />
                            </IonItem>
                          </div>
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="teacher">
                      {(field) => (
                        <div className="field-group">
                          <label className="field-label">Lehrer/in</label>
                          <div className="input-wrapper glass-input">
                            <IonItem lines="none" className="input-item">
                              <div slot="start" className="input-icon-wrapper">
                                <IonIcon
                                  icon={personOutline}
                                  className="input-icon"
                                />
                              </div>
                              <IonInput
                                value={field.state.value}
                                placeholder="z.B. Frau Schmidt"
                                onIonInput={(e) =>
                                  field.handleChange(e.detail.value || '')
                                }
                                className="input-field"
                                clearInput
                              />
                            </IonItem>
                          </div>
                        </div>
                      )}
                    </form.Field>
                  </div>

                  <div className="form-actions">
                    <IonButton
                      fill="clear"
                      onClick={() => {
                        setShowAddForm(false);
                        form.reset();
                        form.setFieldValue('weight', 100);
                      }}
                      className="cancel-button"
                    >
                      Abbrechen
                    </IonButton>
                    <form.Subscribe selector={(state) => [state.values.name]}>
                      {([name]) => (
                        <IonButton
                          onClick={handleAddSubject}
                          disabled={!name?.trim()}
                          className="save-button"
                        >
                          Hinzufügen
                        </IonButton>
                      )}
                    </form.Subscribe>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {currentSchoolSubjects.length > 0 && (
          <div className="subjects-section">
            <h3 className="subsection-title">Deine Fächer</h3>
            <div className="subjects-list">
              {currentSchoolSubjects.map((subject) => (
                <div key={subject.id} className="glass-card subject-item">
                  <div className="subject-content">
                    <div className="subject-avatar">
                      {subject.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="subject-info">
                      <h4 className="subject-name">{subject.name}</h4>
                      <p className="subject-details">
                        {subject.teacher && `${subject.teacher}`}
                        {subject.weight !== 100 &&
                          ` • ${subject.weight}% Gewichtung`}
                      </p>
                    </div>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => handleRemoveSubject(subject.id)}
                      className="remove-button"
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Subject Form */}
      </div>

      <div className="step-footer">
        <div className="button-group">
          <IonButton expand="block" onClick={onNext} className="primary-button">
            Weiter
            <IonIcon slot="end" icon={arrowForward} />
          </IonButton>
        </div>
      </div>
    </div>
  );
};

export default SubjectStep;
