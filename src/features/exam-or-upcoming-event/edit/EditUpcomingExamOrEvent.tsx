// pages/EditUpcomingExamOrEvent.tsx
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import { useDispatch } from 'react-redux';
import { deleteExam, updateExam } from '@/store/examsSlice';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';

interface Exam {
  id: string;
  title: string;
  date: string;
  subject: string;
  description: string;
}

interface LocationState {
  exam: Exam;
}

interface EditExamProps {
  path: string;
}

const EditUpcomingExamOrEvent: React.FC<EditExamProps> = ({ path }) => {
  const location = useLocation<LocationState>();
  const history = useHistory();
  const dispatch = useDispatch();
  const { exam } = location.state || {
    exam: { id: '', title: '', date: '', subject: '', description: '' },
  };
  const [title, setTitle] = useState(exam.title);
  const [date, setDate] = useState(exam.date);
  const [subject, setSubject] = useState(exam.subject);
  const [description, setDescription] = useState(exam.description);
  const handleSave = () => {
    const updatedExam: Exam = {
      id: exam.id,
      title: title.trim(),
      date,
      subject: subject.trim(),
      description: description.trim(),
    };
    dispatch(updateExam(updatedExam));
    history.replace(path);
  };
  const handleDelete = () => {
    if (
      window.confirm(
        `Möchten Sie die Prüfung "${exam.title}" wirklich löschen?`,
      )
    ) {
      dispatch(deleteExam(exam.id));
      history.replace(path);
    }
  };
  return (
    <IonPage>
      <Header
        title={'Prüfung bearbeiten'}
        backButton={true}
        defaultHref={'/main/home'}
        endSlot={
          <Button
            handleEvent={handleDelete}
            text={'Löschen'}
            color="danger"
            fill={'solid'}
          />
        }
      />
      <FormField
        label={'Titel'}
        value={title}
        onChange={(value) => setTitle(value || '')}
        placeholder={'Titel bearbeiten'}
      />
      <FormField
        label={'Datum'}
        value={date}
        onChange={(e) => setDate(e || '')}
        type="date"
      />
      <FormField
        label={'Fach'}
        value={subject}
        onChange={(value) => setSubject(value || '')}
        placeholder={'Fach bearbeiten'}
      />
      <FormField
        label={'Beschreibung'}
        value={description}
        onChange={(value) => setDescription(value || '')}
        placeholder={'Beschreibung bearbeiten'}
      />

      <Button handleEvent={handleSave} text={'Speichern'} />
    </IonPage>
  );
};

export default EditUpcomingExamOrEvent;
