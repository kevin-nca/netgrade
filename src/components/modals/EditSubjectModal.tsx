import React, { useEffect } from 'react';
import {
  IonModal,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/react';
import { bookOutline } from 'ionicons/icons';
import { useAppForm } from '@/components/Form2/form';
import { z } from 'zod';

interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: { id: string; name: string } | null;
  onSave: (newName: string) => void;
  loading?: boolean;
}

const subjectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Bitte gib einen Fachnamen ein')
    .max(100, 'Fachname ist zu lang'),
});

type SubjectFormData = z.infer<typeof subjectFormSchema>;

const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
  onSave,
  loading,
}) => {
  const form = useAppForm({
    defaultValues: {
      name: subject?.name || '',
    } as SubjectFormData,
    validators: {
      onSubmit: subjectFormSchema,
    },
    onSubmit: async ({ value }) => {
      onSave(value.name.trim());
    },
  });

  useEffect(() => {
    const newName = subject?.name || '';
    form.setFieldValue('name', newName);
  }, [subject, form]);

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
              <div className="modal-input-wrapper">
                <form.AppField name="name">
                  {(field) => <field.EditSubjectField label="Fachname" />}
                </form.AppField>
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
                <form.Subscribe selector={(state) => [state.values.name]}>
                  {([name]) => (
                    <button
                      onClick={() => form.handleSubmit()}
                      disabled={!name.trim() || loading}
                      className="modal-button save"
                    >
                      {loading ? 'Speichert...' : 'Speichern'}
                    </button>
                  )}
                </form.Subscribe>
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
