import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IonPage, IonToast } from '@ionic/react';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import FormField from '@/components/Form/FormField';
import { useExam, useUpdateExam, useDeleteExam } from '@/hooks/queries';
import { Routes } from '@/routes';

interface ExamFormData {
  id: string;
  title: string;
  date: string;
  subject: string;
  description: string;
}

interface ExamParams {
  examId: string;
}

const EditExamPage: React.FC = () => {
  const { examId } = useParams<ExamParams>();
  const history = useHistory();

  const { data: exam, isLoading, error } = useExam(examId);

  const [formData, setFormData] = useState<ExamFormData>({
    id: examId,
    title: '',
    date: '',
    subject: '',
    description: '',
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Update form data when exam data is loaded
  React.useEffect(() => {
    if (exam) {
      setFormData({
        id: exam.id,
        title: exam.name,
        date: exam.date.toISOString().split('T')[0],
        subject: exam.subjectId,
        description: exam.description || '',
      });
    }
  }, [exam]);

  const showAndSetToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleFormChange = <K extends keyof ExamFormData>(
    field: K,
    value: ExamFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateExamMutation = useUpdateExam();

  const handleSave = () => {
    const updatedExam = {
      id: formData.id,
      name: formData.title.trim(),
      date: new Date(formData.date),
      subjectId: formData.subject,
      description: formData.description.trim(),
    };

    updateExamMutation.mutate(updatedExam, {
      onSuccess: () => {
        history.replace(Routes.HOME);
      },
      onError: (error) => {
        console.error('Failed to update exam:', error);
        showAndSetToastMessage(`Fehler: ${error.message}`);
      },
    });
  };

  const deleteExamMutation = useDeleteExam();

  const handleDelete = () => {
    if (
      window.confirm(
        `Möchten Sie die Prüfung "${formData.title}" wirklich löschen?`,
      )
    ) {
      deleteExamMutation.mutate(formData.id, {
        onSuccess: () => {
          history.replace(Routes.HOME);
        },
        onError: (error) => {
          console.error('Failed to delete exam:', error);
          showAndSetToastMessage(`Fehler: ${error.message}`);
        },
      });
    }
  };

  if (isLoading) {
    return <IonPage>Loading...</IonPage>;
  }

  if (error) {
    return <IonPage>Error: {error.message}</IonPage>;
  }

  return (
    <IonPage>
      <Header
        title={'Prüfung bearbeiten'}
        backButton={true}
        defaultHref={Routes.HOME}
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
        value={formData.title}
        onChange={(value) => handleFormChange('title', String(value) || '')}
        placeholder={'Titel bearbeiten'}
      />
      <FormField
        label={'Datum'}
        value={formData.date}
        onChange={(value) => handleFormChange('date', String(value) || '')}
        type="date"
      />
      <FormField
        label={'Fach'}
        value={formData.subject}
        onChange={(value) => handleFormChange('subject', String(value) || '')}
        placeholder={'Fach bearbeiten'}
      />
      <FormField
        label={'Beschreibung'}
        value={formData.description}
        onChange={(value) =>
          handleFormChange('description', String(value) || '')
        }
        placeholder={'Beschreibung bearbeiten'}
      />

      <Button handleEvent={handleSave} text={'Speichern'} />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color="danger"
      />
    </IonPage>
  );
};

export default EditExamPage;
