import React from 'react';
import {
  IonModal,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
} from '@ionic/react';
import { school as schoolIcon } from 'ionicons/icons';
import { useAppForm } from '@/components/Form2/form';
import { z } from 'zod';

const schoolFormSchema = z.object({
  schoolName: z.string().min(1, 'Bitte gib einen Schulnamen ein'),
});

type SchoolFormData = z.infer<typeof schoolFormSchema>;

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
  const form = useAppForm({
    defaultValues: {
      schoolName: '',
    } as SchoolFormData,
    validators: {
      onSubmit: schoolFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onAdd(value.schoolName.trim());
    },
  });

  const handleAdd = () => {
    form.handleSubmit();
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

            <div className="form-fields">
              <form.AppField name="schoolName">
                {(field) => <field.AddSchoolField label="Schulname" />}
              </form.AppField>
            </div>

            <div className="modal-button-section">
              <div className="modal-buttons">
                <IonButton
                  onClick={onClose}
                  fill="clear"
                  disabled={isLoading}
                  expand="block"
                >
                  Abbrechen
                </IonButton>
                <IonButton
                  onClick={handleAdd}
                  disabled={isLoading}
                  expand="block"
                  color="primary"
                >
                  {isLoading ? 'Speichert...' : 'Hinzufügen'}
                </IonButton>
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
