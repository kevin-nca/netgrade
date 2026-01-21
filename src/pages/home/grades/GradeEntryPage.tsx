import React from 'react';
import { IonPage } from '@ionic/react';
import GradeEntryForm from '@/features/Form/grade-entry/components/GradeEntryForm';

const GradeEntryPage: React.FC = () => {
  return (
    <IonPage>
      <GradeEntryForm />
    </IonPage>
  );
};

export default GradeEntryPage;
