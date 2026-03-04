import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {
  schoolOutline,
  addOutline,
  trashOutline,
  businessOutline,
  arrowForward,
} from 'ionicons/icons';
import { OnboardingDataTemp, TempSchool, SCHOOL_TYPES } from '../../types';
import './SchoolStep.css';
import '../SharedStepStyles.css';

interface SchoolStepProps {
  data: OnboardingDataTemp;
  setData: React.Dispatch<React.SetStateAction<OnboardingDataTemp>>;
  selectedSchoolId: string;
  setSelectedSchoolId: React.Dispatch<React.SetStateAction<string>>;
  generateId: () => string;
  onNext: () => void;
}

const SchoolStep: React.FC<SchoolStepProps> = ({
  data,
  setData,
  selectedSchoolId,
  setSelectedSchoolId,
  generateId,
  onNext,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      type: '',
    },
    onSubmit: async ({ value }) => {
      const school: TempSchool = {
        id: generateId(),
        name: value.name.trim(),
        address: value.address?.trim() || null,
        type: value.type || null,
      };

      setData((prev) => ({
        ...prev,
        schools: [...prev.schools, school],
      }));

      form.reset();
      setShowAddForm(false);
    },
  });

  const handleAddSchool = () => {
    form.handleSubmit();
  };

  const handleRemoveSchool = (schoolId: string) => {
    setData((prev) => ({
      ...prev,
      schools: prev.schools.filter((s) => s.id !== schoolId),
      subjects: prev.subjects.filter((s) => s.schoolId !== schoolId),
    }));
    if (selectedSchoolId === schoolId) {
      setSelectedSchoolId('');
    }
  };

  const handleNext = () => {
    if (data.schools.length > 0) {
      onNext();
    }
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <div className="gradient-orb" />
        <div className="step-content">
          <div className="step-icon-wrapper">
            <IonIcon icon={schoolOutline} className="step-icon" />
          </div>
          <div className="step-text">
            <h1 className="step-title">Deine Schulen</h1>
            <p className="step-subtitle">
              Füge deine Bildungseinrichtungen hinzu
            </p>
          </div>
        </div>
      </div>

      {/* Add School Form */}
      <div className="add-section">
        {data.schools.length < 2 &&
          (!showAddForm ? (
            <div className="glass-card add-prompt">
              <div className="add-content" onClick={() => setShowAddForm(true)}>
                <div className="add-icon-wrapper">
                  <IonIcon icon={addOutline} className="add-icon" />
                </div>
                <div className="add-text">
                  <h4>Schule hinzufügen</h4>
                  <p>Tippe hier, um eine neue Schule zu erstellen</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card add-form">
              <div className="form-content">
                <h3 className="form-title">Neue Schule erstellen</h3>

                <div className="form-fields">
                  <form.Field name="name">
                    {(field) => (
                      <div className="field-group">
                        <label className="field-label">Schulname *</label>
                        <div className="input-wrapper glass-input">
                          <IonItem lines="none" className="input-item">
                            <div slot="start" className="input-icon-wrapper">
                              <IonIcon
                                icon={schoolOutline}
                                className="input-icon"
                              />
                            </div>
                            <IonInput
                              value={field.state.value}
                              placeholder="z.B. BBW"
                              onIonChange={(e) =>
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

                  <form.Field name="type">
                    {(field) => (
                      <div className="field-group">
                        <label className="field-label">Schultyp</label>
                        <div className="input-wrapper glass-input">
                          <IonItem lines="none" className="input-item">
                            <div slot="start" className="input-icon-wrapper">
                              <IonIcon
                                icon={businessOutline}
                                className="input-icon"
                              />
                            </div>
                            <IonSelect
                              value={field.state.value}
                              placeholder="Wähle den Schultyp"
                              onIonChange={(e) =>
                                field.handleChange(e.detail.value)
                              }
                              className="input-field"
                              interface="popover"
                            >
                              {SCHOOL_TYPES.map((type) => (
                                <IonSelectOption key={type} value={type}>
                                  {type}
                                </IonSelectOption>
                              ))}
                            </IonSelect>
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
                    }}
                    className="cancel-button"
                  >
                    Abbrechen
                  </IonButton>
                  <form.Subscribe selector={(state) => [state.values.name]}>
                    {([name]) => (
                      <IonButton
                        onClick={handleAddSchool}
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

      <div className="step-body">
        {/* Existing Schools */}
        {data.schools.length > 0 && (
          <div className="schools-section">
            <h3 className="subsection-title">Deine Schulen</h3>
            <div className="schools-list">
              {data.schools.map((school, index) => (
                <div key={school.id} className="glass-card school-item">
                  <div className="school-content">
                    <div className={`school-avatar school-${index % 4}`}>
                      {school.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="school-info">
                      <h4 className="school-name">{school.name}</h4>
                      <p className="school-details">
                        {school.type && `${school.type}`}
                      </p>
                    </div>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => handleRemoveSchool(school.id)}
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
      </div>

      <div className="step-footer">
        <div className="button-group">
          <IonButton
            expand="block"
            onClick={handleNext}
            disabled={data.schools.length === 0}
            className="primary-button"
          >
            Weiter
            <IonIcon slot="end" icon={arrowForward} />
          </IonButton>
        </div>
      </div>
    </div>
  );
};

export default SchoolStep;
