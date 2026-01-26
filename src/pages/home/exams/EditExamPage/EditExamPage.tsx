import React from 'react';
import { IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import ExamDetailsForm from '@/features/edit-exam/exam-details-form';
import { Routes } from '@/routes';

const EditExamPage: React.FC = () => {
  const history = useHistory();

  const handleSubmit = () => {
    history.replace(Routes.HOME);
  };

  return (
    <IonPage>
      <ExamDetailsForm
        onGradeSuccess={handleSubmit}
        onDeleteSuccess={handleSubmit}
        onEditSuccess={handleSubmit}
        onError={handleSubmit}
      />
    </IonPage>
  );
};

export default EditExamPage;
