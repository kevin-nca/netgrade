import React from 'react';
import { useForm } from '@tanstack/react-form';
import {
  IonModal,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonInput,
} from '@ionic/react';
import { pencilOutline, school as schoolIcon } from 'ionicons/icons';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  setSchoolName: (value: string) => void;
  onAdd: () => void;
  isLoading: boolean;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({
  isOpen,
  onClose,
  schoolName,
  setSchoolName,
  onAdd,
  isLoading,
}) => {
  const form = useForm({
    defaultValues: {
      schoolName: schoolName,
    },
    onSubmit: async () => {
      onAdd();
    },
  });

  React.useEffect(() => {
    form.setFieldValue('schoolName', schoolName);
  }, [schoolName, form]);

  const handleInputChange = (value: string) => {
    setSchoolName(value);
    form.setFieldValue('schoolName', value);
  };
  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      initialBreakpoint={0.75}
      backdropBreakpoint={0.5}
      className="settings-modal"
    >
      <IonPage className="modal-page">
        <IonHeader className="modal-header">
          <IonToolbar className="modal-toolbar">
            <IonTitle className="modal-title">Neue Schule</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content" scrollY={true}>
          <div className="modal-content-wrapper">
            <div className="modal-header-section">
              <div className="modal-gradient-orb" />
              <div className="modal-header-content">
                <div className="modal-header-flex">
                  <div className="modal-icon-wrapper">
                    <IonIcon icon={schoolIcon} className="modal-icon" />
                  </div>
                  <div className="modal-text">
                    <h1>Schule hinzufügen</h1>
                    <p>Erstelle eine neue Schule</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-input-section">
              <h2 className="modal-section-title">Schulname eingeben</h2>

              <div className="modal-input-wrapper glass-input">
                <IonItem lines="none" className="modal-input-item">
                  <div slot="start" className="modal-input-icon-wrapper">
                    <IonIcon
                      icon={pencilOutline}
                      className="modal-input-icon"
                    />
                  </div>
                  <IonInput
                    value={schoolName}
                    placeholder="Name der Schule..."
                    onIonChange={(e) => handleInputChange(e.detail.value || '')}
                    className="modal-input-field"
                    clearInput
                    autoFocus
                  />
                </IonItem>
              </div>
            </div>

            <div className="modal-button-section">
              <div className="modal-buttons">
                <button
                  onClick={onClose}
                  className="modal-button cancel"
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
                <button
                  onClick={onAdd}
                  disabled={!schoolName.trim() || isLoading}
                  className="modal-button save"
                >
                  {isLoading ? 'Speichert...' : 'Hinzufügen'}
                </button>
              </div>
            </div>

            <div className="modal-bottom-spacer" />
          </div>
        </IonContent>
      </IonPage>
    </IonModal>
  );
};

export default AddSchoolModal;
