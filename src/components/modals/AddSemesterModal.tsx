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
import { timeOutline } from 'ionicons/icons';
import {
  AddSemesterForm,
  AddSemesterPayload,
} from '@/features/add-semester/add-semester-form';
import { School } from '@/db/entities';

interface AddSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: AddSemesterPayload) => void;
  isLoading: boolean;
  schools: School[];
}

const AddSemesterModal: React.FC<AddSemesterModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isLoading,
  schools,
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
            <IonTitle className="modal-title">Neues Semester</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content" scrollY={true}>
          <div className="modal-content-wrapper">
            <div className="modal-header-section">
              <div className="modal-gradient-orb" />
              <div className="modal-header-content">
                <div className="modal-header-flex">
                  <div className="modal-icon-wrapper">
                    <IonIcon icon={timeOutline} className="modal-icon" />
                  </div>
                  <div className="modal-text">
                    <h1>Semester hinzufügen</h1>
                    <p>Erstelle ein neues Semester</p>
                  </div>
                </div>
              </div>
            </div>

            <AddSemesterForm
              onSubmit={onAdd}
              onCancel={onClose}
              isLoading={isLoading}
              schools={schools}
            />

            <div className="modal-bottom-spacer" />
          </div>
        </IonContent>
      </IonPage>
    </IonModal>
  );
};

export default AddSemesterModal;
