import React, { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  IonContent,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonModal,
} from '@ionic/react';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import { Subject } from '@/db/entities';
import { FormElement } from '@/components/Form/FormElements';
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
  removeFromSubjectsOrModules,
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

  const handleRemoveSubject = (subjectId: string) => {
    setLocalSubjects(localSubjects.filter((s) => s.id !== subjectId));
    removeFromSubjectsOrModules(subjectId);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={closeModal}
      breakpoints={[0, 0.3, 1]}
      initialBreakpoint={0.5}
    >
      <Header title="Fächer auswählen" backButton={false} />
      <IonContent>
        <FormElement.SearchText
          form={form}
          placeholder="Suche Fächer"
          fieldName="searchText"
        />

        {localSubjects
          .filter((subject: Subject) =>
            form.state.values.searchText
              ? subject.name
                  .toLowerCase()
                  .includes(form.state.values.searchText.toLowerCase())
              : true,
          )
          .map((subject) => (
            <IonItemSliding key={subject.id}>
              <IonItem>
                <IonLabel>{subject.name}</IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption
                  color="danger"
                  onClick={() => handleRemoveSubject(subject.id)}
                >
                  Löschen
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}

        <FormElement.SubjectName
          form={form}
          placeholder="Neues Fach hinzufügen"
          fieldName="newSubjectName"
          label=""
        />
        <Button handleEvent={handleAddSubject} text={'Hinzufügen'} />
      </IonContent>
    </IonModal>
  );
};

export default SubjectSelectionModal;
