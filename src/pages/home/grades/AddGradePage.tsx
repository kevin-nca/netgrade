import React from 'react';
import { IonPage } from '@ionic/react';
import AddGradeForm from '@/features/Form/add-grade/components/AddGradeForm';

const AddGradePage: React.FC = () => {
  return (
    <IonPage>
      <AddGradeForm />
    </IonPage>
  );
};

export default AddGradePage;
