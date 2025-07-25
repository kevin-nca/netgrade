import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonTextarea,
} from '@ionic/react';
import {
  bookOutline,
  addOutline,
  trashOutline,
  personOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  arrowForward,
} from 'ionicons/icons';
import { OnboardingDataTemp, TempSchool, TempSubject } from '../../types';
import './SubjectStep.css';

interface SubjectStepProps {
  data: OnboardingDataTemp;
  setData: React.Dispatch<React.SetStateAction<OnboardingDataTemp>>;
  selectedSchoolId: string;
  setSelectedSchoolId: React.Dispatch<React.SetStateAction<string>>;
  generateId: () => string;
  onNext: () => void;
}

const SubjectStep: React.FC<SubjectStepProps> = ({
  data,
  setData,
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
  const [newSubject, setNewSubject] = useState<Partial<TempSubject>>({
    name: '',
    teacher: '',
    description: '',
    weight: 100,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (selectedSchool) {
      setSelectedSchoolId(selectedSchool.id);
    }
  }, [selectedSchool, setSelectedSchoolId]);

  const handleAddSubject = () => {
    if (newSubject.name?.trim() && selectedSchool) {
      const subject: TempSubject = {
        id: generateId(),
        name: newSubject.name.trim(),
        teacher: newSubject.teacher?.trim() || null,
        description: newSubject.description?.trim() || null,
        weight: 100,
        schoolId: selectedSchool.id,
      };

      setData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, subject],
      }));

      setNewSubject({ name: '', teacher: '', description: '', weight: 100 });
      setShowAddForm(false);
    }
  };

  const handleRemoveSubject = (subjectId: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
    }));
  };

  const currentSchoolSubjects = data.subjects.filter(
    (s) => s.schoolId === selectedSchool?.id,
  );

  if (!selectedSchool) {
    return (
      <div className="onboarding-step">
        <div className="step-header">
          <h1>Keine Schule ausgewählt</h1>
        </div>
      </div>
    );
  }

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
              Erstelle Fächer für {selectedSchool.name}
            </p>
          </div>
        </div>
      </div>

      <div className="step-body">
        {/* School Selector */}
        {data.schools.length > 1 && (
          <div className="school-selector">
            <h3 className="subsection-title">Schule auswählen</h3>
            <div className="schools-grid">
              {data.schools.map((school, index) => (
                <div
                  key={school.id}
                  className={`glass-card school-selector-item ${school.id === selectedSchool.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSchool(school)}
                >
                  <div className={`school-avatar school-${index % 4}`}>
                    {school.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="school-selector-name">{school.name}</span>
                  {school.id === selectedSchool.id && (
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

        {/* Existing Subjects */}
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
        <div className="add-section">
          {!showAddForm ? (
            <div className="glass-card add-prompt">
              <div className="add-content" onClick={() => setShowAddForm(true)}>
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
                  <div className="field-group">
                    <label className="field-label">Fachname *</label>
                    <div className="input-wrapper glass-input">
                      <IonItem lines="none" className="input-item">
                        <div slot="start" className="input-icon-wrapper">
                          <IonIcon icon={bookOutline} className="input-icon" />
                        </div>
                        <IonInput
                          value={newSubject.name}
                          placeholder="z.B. Mathematik"
                          onIonChange={(e) =>
                            setNewSubject((prev) => ({
                              ...prev,
                              name: e.detail.value || '',
                            }))
                          }
                          className="input-field"
                          clearInput
                        />
                      </IonItem>
                    </div>
                  </div>

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
                          value={newSubject.teacher}
                          placeholder="z.B. Frau Schmidt"
                          onIonChange={(e) =>
                            setNewSubject((prev) => ({
                              ...prev,
                              teacher: e.detail.value || '',
                            }))
                          }
                          className="input-field"
                          clearInput
                        />
                      </IonItem>
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Beschreibung</label>
                    <div className="input-wrapper glass-input">
                      <IonItem lines="none" className="input-item">
                        <div slot="start" className="input-icon-wrapper">
                          <IonIcon
                            icon={documentTextOutline}
                            className="input-icon"
                          />
                        </div>
                        <IonTextarea
                          value={newSubject.description}
                          placeholder="Zusätzliche Informationen..."
                          onIonChange={(e) =>
                            setNewSubject((prev) => ({
                              ...prev,
                              description: e.detail.value || '',
                            }))
                          }
                          className="input-field"
                          rows={2}
                          autoGrow
                        />
                      </IonItem>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <IonButton
                    fill="clear"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewSubject({
                        name: '',
                        teacher: '',
                        description: '',
                        weight: 100,
                      });
                    }}
                    className="cancel-button"
                  >
                    Abbrechen
                  </IonButton>
                  <IonButton
                    onClick={handleAddSubject}
                    disabled={!newSubject.name?.trim()}
                    className="save-button"
                  >
                    Hinzufügen
                  </IonButton>
                </div>
              </div>
            </div>
          )}
        </div>
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
