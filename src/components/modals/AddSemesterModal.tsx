import React from 'react';
import { IonContent, IonModal } from '@ionic/react';
import {
  AddSemesterForm,
  AddSemesterPayload,
} from '@/features/add-semester/add-semester-form';
import { School } from '@/db/entities';
import styles from './popup-modal.module.css';

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
      className={styles.modal}
      style={{ '--height': '75%' }}
    >
      <div className={styles.modalContent}>
        <h1>Semester hinzufügen</h1>
      </div>
      <IonContent scrollY={true}>
        <div className={styles.formFields}>
          <AddSemesterForm
            onSubmit={onAdd}
            onCancel={onClose}
            isLoading={isLoading}
            schools={schools}
          />
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AddSemesterModal;
