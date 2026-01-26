import React from 'react';
import { IonPage } from '@ionic/react';
import AddExamForm from '@/features/add-exam/components/AddExamForm';

const AddExamPage: React.FC = () => {
  return (
    <IonPage>
      <AddExamForm />
    </IonPage>
  );
};

export default AddExamPage;
