import React, { useEffect } from 'react';
import { IonContent, IonModal } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { Subject } from '@/db/entities';
import { useAppForm } from '@/shared/components/form';
import {
  subjectFormSchema,
  type SubjectFormData,
} from './schema/subject-form-schema';
import ModalSubmitButton from '@/shared/components/buttons/submitt-button/modal-submit-button';
import ModalCancelButton from '@/shared/components/buttons/cancel-button/modal-cancel-button';
import ModalButtonGroup from '@/shared/components/buttons/modal-button-group';
import styles from './styles/subject-selection-modal.module.css';

interface SubjectSelectionSlideUpProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  availableSubjects: number[];
  isModule: boolean;
  subjectsOrModules: Subject[];
  addToSubjectsOrModules: (subject: Subject) => void;
  removeFromSubjectsOrModules: (subjectId: string) => void;
}

const generateTempId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const SubjectSelectionModal: React.FC<SubjectSelectionSlideUpProps> = ({
  isOpen,
  setIsOpen,
  subjectsOrModules = [],
  addToSubjectsOrModules,
}) => {
  const form = useAppForm({
    defaultValues: {
      newSubjectName: '',
    } as SubjectFormData,
    validators: {
      onSubmit: subjectFormSchema,
    },
    onSubmit: async ({ value }) => {
      const isDuplicate = subjectsOrModules.some(
        (subject) =>
          subject.name.toLowerCase() ===
          value.newSubjectName.trim().toLowerCase(),
      );
      if (isDuplicate) {
        console.error(`Fach "${value.newSubjectName}" existiert bereits`);
        return;
      }

      const newSubject: Partial<Subject> & { id: string; name: string } = {
        id: generateTempId(),
        name: value.newSubjectName.trim(),
        teacher: null,
      };

      addToSubjectsOrModules(newSubject as Subject);
      form.reset();
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleAddSubject = () => {
    form.handleSubmit();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={closeModal}
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        <h1>Fach hinzufügen</h1>
      </div>
      <IonContent scrollY={false}>
        <div className={styles.addSubject}>
          <form.AppField name="newSubjectName">
            {(field) => <field.EditSubjectField label="Fachname" />}
          </form.AppField>
        </div>
        <ModalButtonGroup>
          <ModalCancelButton onClick={closeModal} text="Abbrechen" />
          <form.Subscribe selector={(state) => [state.values.newSubjectName]}>
            {([newSubjectName]) => (
              <ModalSubmitButton
                onClick={handleAddSubject}
                disabled={!newSubjectName.trim()}
                text="Hinzufügen"
                icon={addOutline}
              />
            )}
          </form.Subscribe>
        </ModalButtonGroup>
      </IonContent>
    </IonModal>
  );
};

export default SubjectSelectionModal;
