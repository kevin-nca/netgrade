import React from 'react';
import { IonContent, IonModal } from '@ionic/react';
import { AddSchoolForm } from '@/features/add-school/add-school-form';
import styles from './popup-modal.module.css';

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
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className={styles.modal}>
      <div className={styles.modalContent}>
        <h1>Schule hinzufügen</h1>
      </div>
      <IonContent scrollY={false}>
        <div className={styles.formFields}>
          <AddSchoolForm
            onSubmit={onAdd}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AddSchoolModal;
