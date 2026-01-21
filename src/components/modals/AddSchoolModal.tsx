import React from 'react';
import {
  IonModal,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/react';
import { school as schoolIcon } from 'ionicons/icons';
import { AddSchoolForm } from '@/features/Form/add-school/components/AddSchoolForm';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (schoolName: string) => void;
  isLoading: boolean;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isLoading,
}) => {
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

            <AddSchoolForm
              onSubmit={onAdd}
              onCancel={onClose}
              isLoading={isLoading}
            />

            <div className="modal-bottom-spacer" />
          </div>
        </IonContent>
      </IonPage>
    </IonModal>
  );
};

export default AddSchoolModal;
