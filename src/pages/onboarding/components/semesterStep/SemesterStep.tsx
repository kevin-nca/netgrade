import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonDatetime,
  IonModal,
} from '@ionic/react';
import {
  calendarOutline,
  addOutline,
  trashOutline,
  arrowForward,
} from 'ionicons/icons';
import { OnboardingDataTemp, TempSemester } from '../../types';
import './SemesterStep.css';

interface SemesterStepProps {
  data: OnboardingDataTemp;
  setData: React.Dispatch<React.SetStateAction<OnboardingDataTemp>>;
  selectedSemesterId: string;
  setSelectedSemesterId: React.Dispatch<React.SetStateAction<string>>;
  generateId: () => string;
  onNext: () => void;
}

const SemesterStep: React.FC<SemesterStepProps> = ({
  data,
  setData,
  selectedSemesterId,
  setSelectedSemesterId,
  generateId,
  onNext,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showEndDateModal, setShowEndDateModal] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      startDate: new Date().toISOString(),
      endDate: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d.toISOString();
      })(),
    },
    onSubmit: async ({ value }) => {
      const semester: TempSemester = {
        id: generateId(),
        name: value.name.trim(),
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
      };

      setData((prev) => ({
        ...prev,
        semesters: [...prev.semesters, semester],
      }));

      // Setze das neue Semester als ausgewählt, wenn es das erste ist
      if (data.semesters.length === 0) {
        setSelectedSemesterId(semester.id);
      }

      form.reset();
      setShowAddForm(false);
    },
  });

  const handleAddSemester = () => {
    form.handleSubmit();
  };

  const handleRemoveSemester = (semesterId: string) => {
    setData((prev) => ({
      ...prev,
      semesters: prev.semesters.filter((s) => s.id !== semesterId),
      // Entferne auch alle Subjects die zu diesem Semester gehören
      subjects: prev.subjects.filter((s) => s.semesterId !== semesterId),
    }));

    // Wenn das gelöschte Semester ausgewählt war, wähle ein anderes
    if (selectedSemesterId === semesterId) {
      const remainingSemesters = data.semesters.filter(
        (s) => s.id !== semesterId,
      );
      setSelectedSemesterId(remainingSemesters[0]?.id || '');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleNext = () => {
    if (data.semesters.length > 0) {
      // Stelle sicher, dass ein Semester ausgewählt ist
      if (!selectedSemesterId && data.semesters.length > 0) {
        setSelectedSemesterId(data.semesters[0].id);
      }
      onNext();
    }
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <div className="gradient-orb" />
        <div className="step-content">
          <div className="step-icon-wrapper">
            <IonIcon icon={calendarOutline} className="step-icon" />
          </div>
          <div className="step-text">
            <h1 className="step-title">Deine Semester</h1>
            <p className="step-subtitle">
              Organisiere deine Fächer nach Semestern
            </p>
          </div>
        </div>
      </div>

      {/* Add Semester Form */}
      <div className="add-section">
        {data.semesters.length < 3 &&
          (!showAddForm ? (
            <div className="glass-card add-prompt">
              <div className="add-content" onClick={() => setShowAddForm(true)}>
                <div className="add-icon-wrapper">
                  <IonIcon icon={addOutline} className="add-icon" />
                </div>
                <div className="add-text">
                  <h4>Semester hinzufügen</h4>
                  <p>Tippe hier, um ein neues Semester zu erstellen</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card add-form">
              <div className="form-content">
                <h3 className="form-title">Neues Semester erstellen</h3>

                <div className="form-fields">
                  <form.Field name="name">
                    {(field) => (
                      <div className="field-group">
                        <label className="field-label">Semester Name *</label>
                        <div className="input-wrapper glass-input">
                          <IonItem lines="none" className="input-item">
                            <div slot="start" className="input-icon-wrapper">
                              <IonIcon
                                icon={calendarOutline}
                                className="input-icon"
                              />
                            </div>
                            <IonInput
                              value={field.state.value}
                              placeholder="z.B. HS 2024 oder 1. Semester"
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

                  <form.Field name="startDate">
                    {(field) => (
                      <div className="field-group">
                        <label className="field-label">Startdatum</label>
                        <div
                          className="input-wrapper glass-input date-input"
                          onClick={() => setShowStartDateModal(true)}
                        >
                          <IonItem lines="none" className="input-item">
                            <div slot="start" className="input-icon-wrapper">
                              <IonIcon
                                icon={calendarOutline}
                                className="input-icon"
                              />
                            </div>
                            <div className="date-display">
                              {formatDate(new Date(field.state.value))}
                            </div>
                          </IonItem>
                        </div>
                        <IonModal
                          isOpen={showStartDateModal}
                          onDidDismiss={() => setShowStartDateModal(false)}
                        >
                          <IonDatetime
                            value={field.state.value}
                            onIonChange={(e) => {
                              if (e.detail.value) {
                                field.handleChange(e.detail.value as string);
                                setShowStartDateModal(false);
                              }
                            }}
                            presentation="date"
                            locale="de-CH"
                            firstDayOfWeek={1}
                          />
                        </IonModal>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="endDate">
                    {(field) => (
                      <div className="field-group">
                        <label className="field-label">Enddatum</label>
                        <div
                          className="input-wrapper glass-input date-input"
                          onClick={() => setShowEndDateModal(true)}
                        >
                          <IonItem lines="none" className="input-item">
                            <div slot="start" className="input-icon-wrapper">
                              <IonIcon
                                icon={calendarOutline}
                                className="input-icon"
                              />
                            </div>
                            <div className="date-display">
                              {formatDate(new Date(field.state.value))}
                            </div>
                          </IonItem>
                        </div>
                        <IonModal
                          isOpen={showEndDateModal}
                          onDidDismiss={() => setShowEndDateModal(false)}
                        >
                          <IonDatetime
                            value={field.state.value}
                            onIonChange={(e) => {
                              if (e.detail.value) {
                                field.handleChange(e.detail.value as string);
                                setShowEndDateModal(false);
                              }
                            }}
                            presentation="date"
                            locale="de-CH"
                            firstDayOfWeek={1}
                          />
                        </IonModal>
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
                        onClick={handleAddSemester}
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
        {/* Existing Semesters */}
        {data.semesters.length > 0 && (
          <div className="semesters-section">
            <h3 className="subsection-title">Deine Semester</h3>
            <div className="semesters-list">
              {data.semesters.map((semester, index) => (
                <div key={semester.id} className="glass-card semester-item">
                  <div className="semester-content">
                    <div className={`semester-avatar semester-${index % 4}`}>
                      {semester.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="semester-info">
                      <h4 className="semester-name">{semester.name}</h4>
                      <p className="semester-details">
                        {formatDate(semester.startDate)} -{' '}
                        {formatDate(semester.endDate)}
                      </p>
                    </div>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSemester(semester.id);
                      }}
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
            disabled={data.semesters.length === 0}
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

export default SemesterStep;
