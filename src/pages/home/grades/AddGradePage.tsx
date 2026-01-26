import React from 'react';
import { IonPage } from '@ionic/react';
import AddGradeForm from '@/features/add-grade/add-grade-form';

const AddGradePage: React.FC = () => {
  return (
    <IonPage>
      <AddGradeForm />
    </IonPage>
  );
};

export default AddGradePage;
