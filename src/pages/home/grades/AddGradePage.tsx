import React from 'react';
import { IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AddGradeForm from '@/features/add-grade/add-grade-form';
import { Routes } from '@/routes';

const AddGradePage: React.FC = () => {
  const history = useHistory();

  const handleSuccess = () => {
    history.push(Routes.HOME);
  };

  return (
    <IonPage>
      <AddGradeForm onSuccess={handleSuccess} />
    </IonPage>
  );
};

export default AddGradePage;
