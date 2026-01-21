import React, { useEffect } from 'react';
import { IonContent, IonModal, IonButton } from '@ionic/react';
import { Subject } from '@/db/entities';
import { useAppForm } from '@/shared/Form/ui/form';
import {
  subjectFormSchema,
  type SubjectFormData,
} from '@/features/Form/add-subject/subjectFormSchema';
import styles from './SubjectSelectionModal.module.css';

interface SubjectSelectionSlideUpProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  availableSubjects: number[];
  isModule: boolean;
  subjectsOrModules: Subject[];
  addToSubjectsOrModules: (subject: Subject) => void;
  removeFromSubjectsOrModules: (subjectId: string) => void;
}

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
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: value.newSubjectName.trim(),
        teacher: null,
        description: null,
        schoolId: '',
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
        <div className={styles.buttons}>
          <IonButton className={styles.addButton} onClick={handleAddSubject}>
            Hinzufügen
          </IonButton>
          <IonButton className={styles.addButton} onClick={closeModal}>
            Abbrechen
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default SubjectSelectionModal;
