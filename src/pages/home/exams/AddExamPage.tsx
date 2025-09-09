import React, { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { IonContent, IonList, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import { useSchools, useSchoolSubjects, useAddExam } from '@/hooks';
import { Routes } from '@/routes';

const AddExamPage: React.FC = () => {
  const history = useHistory();
  const { data: schools = [] } = useSchools();
  const { mutate: addExam } = useAddExam();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const { data: subjects = [] } = useSchoolSubjects(selectedSchoolId);

  const form = useForm({
    defaultValues: {
      selectedSchool: '',
      selectedSubject: '',
      title: '',
      date: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      const newExam = {
        schoolId: value.selectedSchool,
        subjectId: value.selectedSubject,
        title: value.title.trim(),
        date: new Date(value.date),
        description: value.description.trim(),
      };

      addExam(newExam);
      form.reset();
      history.push(Routes.HOME);
    },
    validators: {
      onSubmit: ({ value }) => {
        if (!value.selectedSchool) {
          alert('Bitte wählen Sie eine Schule aus.');
          return 'Bitte wählen Sie eine Schule aus.';
        }
        if (!value.selectedSubject) {
          alert('Bitte wählen Sie ein Fach aus.');
          return 'Bitte wählen Sie ein Fach aus.';
        }
        if (!value.title.trim()) {
          alert('Bitte geben Sie einen Titel ein.');
          return 'Bitte geben Sie einen Titel ein.';
        }
        if (!value.date) {
          alert('Bitte wählen Sie ein Datum aus.');
          return 'Bitte wählen Sie ein Datum aus.';
        }
        return undefined;
      },
    },
  });

  useEffect(() => {
    form.setFieldValue('selectedSubject', '');
  }, [selectedSchoolId, form]);

  const handleSchoolChange = (value: string | number | boolean) => {
    const newSchoolId = String(value);
    form.setFieldValue('selectedSchool', newSchoolId);
    form.setFieldValue('selectedSubject', '');
    setSelectedSchoolId(newSchoolId);
  };

  const handleSubmit = () => {
    form.handleSubmit();
  };

  return (
    <IonPage>
      <Header
        title={'Prüfung Hinzufügen'}
        backButton={true}
        defaultHref={Routes.HOME}
      />
      <IonContent>
        <IonList>
          <form.Field name="selectedSchool">
            {(field) => (
              <FormField
                label={'Schule'}
                value={field.state.value}
                onChange={handleSchoolChange}
                type={'select'}
                options={schools.map((school) => ({
                  value: school.id,
                  label: school.name,
                }))}
                placeholder={'Wähle eine Schule'}
              />
            )}
          </form.Field>
          <form.Field name="selectedSubject">
            {(field) => (
              <FormField
                label={'Fach'}
                value={field.state.value}
                onChange={(value) => field.handleChange(String(value))}
                type={'select'}
                options={subjects.map((subject) => ({
                  value: subject.id,
                  label: subject.name,
                }))}
                placeholder={'Wähle ein Fach'}
                disabled={!selectedSchoolId || subjects.length === 0}
              />
            )}
          </form.Field>
          <form.Field name="title">
            {(field) => (
              <FormField
                label={'Titel'}
                value={field.state.value}
                onChange={(value) => field.handleChange(String(value))}
                placeholder={'Prüfungstitel'}
              />
            )}
          </form.Field>
          <form.Field name="date">
            {(field) => (
              <FormField
                label={'Datum'}
                type={'date'}
                value={field.state.value}
                onChange={(value) => field.handleChange(String(value))}
              />
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <FormField
                label={'Beschreibung'}
                value={field.state.value}
                onChange={(value) => field.handleChange(String(value))}
                placeholder={'Optionale Beschreibung'}
              />
            )}
          </form.Field>
        </IonList>
        <Button handleEvent={handleSubmit} text={'Hinzufügen'} />
      </IonContent>
    </IonPage>
  );
};

export default AddExamPage;
