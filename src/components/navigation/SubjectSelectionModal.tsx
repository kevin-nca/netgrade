import React, { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { IonContent, IonModal } from '@ionic/react';
import Button from '@/components/Button/Button';
import { Subject } from '@/db/entities';
import { FormElement } from '@/components/Form/FormElements';
import styles from './SubjectSelectionModal.module.css';
interface SubjectModalFormData {
  searchText: string;
  newSubjectName: string;
}

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
  const [localSubjects, setLocalSubjects] =
    useState<Subject[]>(subjectsOrModules);

  const form = useForm({
    defaultValues: {
      searchText: '',
      newSubjectName: '',
    } as SubjectModalFormData,
    onSubmit: async ({ value }) => {
      const newSubject: Partial<Subject> & { id: string; name: string } = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: value.newSubjectName.trim(),
        teacher: null,
        description: null,
        schoolId: '',
      };
      setLocalSubjects([...localSubjects, newSubject as Subject]);
      addToSubjectsOrModules(newSubject as Subject);
      form.setFieldValue('newSubjectName', '');
    },
    validators: {
      onSubmit: ({ value }) => {
        // Check for duplicate subjects (custom validation)
        if (
          value.newSubjectName?.trim() &&
          localSubjects.some(
            (subject) =>
              subject.name.toLowerCase() ===
              value.newSubjectName.trim().toLowerCase(),
          )
        ) {
          return `Fach "${value.newSubjectName}" existiert bereits`;
        }
        return undefined;
      },
    },
  });

  useEffect(() => {
    if (isOpen && subjectsOrModules.length > 0) {
      setLocalSubjects(subjectsOrModules);
    }
  }, [isOpen, subjectsOrModules]);

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
    <div className={styles.subjectModal}>
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
            <FormElement.SubjectName
              form={form}
              placeholder="Neues Fach hinzufügen"
              fieldName="newSubjectName"
              label=""
            />
          </div>
          <div className={styles.buttons}>
            <Button
              className={styles.addButton}
              handleEvent={handleAddSubject}
              text={'Hinzufügen'}
            />
            <Button
              className={styles.addButton}
              handleEvent={closeModal}
              text={'Abbrechen'}
            />
          </div>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default SubjectSelectionModal;
