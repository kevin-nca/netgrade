import React, { useEffect, useState } from 'react';
import { IonContent, IonList, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addExam } from '@/store/examsSlice';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import { Subject } from '@/store/subjectsSlice';

const AddUpcomingGradeOrEventPage: React.FC = () => {
  const history = useHistory();
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();

  const schools = useSelector(
    (state: RootState) => state.schools.schools || [],
  );
  const subjects = useSelector(
    (state: RootState) => state.subjects[selectedSchool] || [],
  );

  useEffect(() => {
    setSelectedSubject('');
  }, [selectedSchool]);

  const handleSubmit = () => {
    if (!selectedSchool) {
      alert('Bitte wählen Sie eine Schule aus.');
      return;
    }
    if (!selectedSubject) {
      alert('Bitte wählen Sie ein Fach aus.');
      return;
    }
    if (!title.trim()) {
      alert('Bitte geben Sie einen Titel ein.');
      return;
    }
    if (!date) {
      alert('Bitte wählen Sie ein Datum aus.');
      return;
    }

    const newExam = {
      school: selectedSchool,
      subject: selectedSubject,
      title: title.trim(),
      date: date,
      description: description.trim(),
    };

    console.log('Neues Exam:', newExam);

    dispatch(addExam(newExam));

    setSelectedSchool('');
    setSelectedSubject('');
    setTitle('');
    setDate('');
    setDescription('');
    history.push('/main/home');
  };

  return (
    <IonPage>
      <Header
        title={'Prüfung Hinzufügen'}
        backButton={true}
        defaultHref={'/main/home'}
      />
      <IonContent>
        <IonList>
          <FormField
            label={'Schule'}
            value={selectedSchool}
            onChange={(value) => setSelectedSchool(value)}
            type={'select'}
            options={schools.map((school) => ({
              value: school.id,
              label: school.name,
            }))}
            placeholder={'Wähle eine Schule'}
          />
          <FormField
            label={'Fach'}
            value={selectedSubject}
            onChange={(value) => setSelectedSubject(value)}
            type={'select'}
            options={subjects.map((subject: Subject) => ({
              value: subject.id,
              label: subject.name,
            }))}
            placeholder={'Wähle ein Fach'}
            disabled={!selectedSchool}
          />
          <FormField
            label={'Titel'}
            value={title}
            onChange={(value) => setTitle(value)}
            placeholder={'Prüfungstitel'}
          />
          <FormField
            label={'Datum'}
            type={'date'}
            value={date}
            onChange={(value) => setDate(value)}
          />
          <FormField
            label={'Beschreibung'}
            value={description}
            onChange={(value) => setDescription(value)}
            placeholder={'Optionale Beschreibung'}
          />
        </IonList>
        <Button handleEvent={handleSubmit} text={'Hinzufügen'} />
      </IonContent>
    </IonPage>
  );
};

export default AddUpcomingGradeOrEventPage;
