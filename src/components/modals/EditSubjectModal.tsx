import React, { useState, useEffect } from 'react';
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
import { pencilOutline, bookOutline } from 'ionicons/icons';

interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: { id: string; name: string } | null;
  onSave: (newName: string) => void;
  loading?: boolean;
}

const EditSubjectModal: React.FC<EditSubjectModalProps> = ({ isOpen, onClose, subject, onSave, loading }) => {
  const [name, setName] = useState(subject?.name || '');

  useEffect(() => {
    setName(subject?.name || '');
  }, [subject]);

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
            <IonTitle className="modal-title">Fach bearbeiten</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content" scrollY={true}>
          <div className="modal-content-wrapper">
            <div className="modal-header-section">
              <div className="modal-gradient-orb" />
              <div className="modal-header-content">
                <div className="modal-header-flex">
                  <div className="modal-icon-wrapper">
                    <IonIcon icon={bookOutline} className="modal-icon" />
                  </div>
                  <div className="modal-text">
                    <h1>Fach bearbeiten</h1>
                    <p>Bearbeite den Namen deines Fachs</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-input-section">
              <h2 className="modal-section-title">Fachname eingeben</h2>
              <div className="modal-input-wrapper glass-input">
                <IonItem lines="none" className="modal-input-item">
                  <div slot="start" className="modal-input-icon-wrapper">
                    <IonIcon icon={pencilOutline} className="modal-input-icon" />
                  </div>
                  <IonInput
                    value={name}
                    placeholder="Fachname..."
                    onIonChange={e => setName(e.detail.value || '')}
                    className="modal-input-field"
                    clearInput
                    autoFocus
                    disabled={loading}
                  />
                </IonItem>
              </div>
            </div>
            <div className="modal-button-section">
              <div className="modal-buttons">
                <button
                  onClick={onClose}
                  className="modal-button cancel"
                  disabled={loading}
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => name.trim() && !loading && onSave(name.trim())}
                  disabled={!name.trim() || loading}
                  className="modal-button save"
                >
                  {loading ? 'Speichert...' : 'Speichern'}
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

export default EditSubjectModal; 