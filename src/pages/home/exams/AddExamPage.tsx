import React from 'react';
import { IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AddExamForm from '@/features/add-exam/add-exam-form';
import { Routes } from '@/routes';

const AddExamPage: React.FC = () => {
  const history = useHistory();

  const handleSuccess = () => {
    history.push(Routes.HOME);
  };

  return (
    <IonPage>
      <AddExamForm onSuccess={handleSuccess} />
    </IonPage>
  );
};

export default AddExamPage;
