import React, { useEffect, useState } from 'react';
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
import FormField from '@/components/Form/FormField';

interface Subject {
  id: string;
  name: string;
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
  isModule,
  subjectsOrModules = [],
  addToSubjectsOrModules,
  removeFromSubjectsOrModules,
}) => {
  const [searchText, setSearchText] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [localSubjects, setLocalSubjects] =
    useState<Subject[]>(subjectsOrModules);

  useEffect(() => {
    if (isOpen && subjectsOrModules.length > 0) {
      setLocalSubjects(subjectsOrModules);
    }
  }, [isOpen, subjectsOrModules]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleAddSubject = () => {
    if (
      newSubjectName &&
      !localSubjects.some((subject) => subject.name === newSubjectName)
    ) {
      const newSubject: Subject = {
        id: '', // FIXME
        name: newSubjectName,
      };
      setLocalSubjects([...localSubjects, newSubject]);
      addToSubjectsOrModules(newSubject);
      setNewSubjectName('');
    }
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
      <Header
        title={isModule ? 'Module auswählen' : 'Fächer auswählen'}
        backButton={false}
      />
      <IonContent>
        <FormField
          value={searchText}
          onChange={(e) => setSearchText(e.toString())} // FIXME
          placeholder={isModule ? 'Suche Module' : 'Suche Fächer'}
        />

        {localSubjects
          .filter((subject: Subject) =>
            searchText
              ? subject.name.toLowerCase().includes(searchText.toLowerCase())
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

        <FormField
          value={newSubjectName}
          onChange={(value) => setNewSubjectName(String(value))} // FIXME
          placeholder={'Neues Fach hinzufügen'}
        />
        <Button handleEvent={handleAddSubject} text={'Hinzufügen'} />
      </IonContent>
    </IonModal>
  );
};

export default SubjectSelectionModal;
