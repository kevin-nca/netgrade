import React from 'react';
import { IonPage } from '@ionic/react';
import GradeEntryForm from '@/features/enter-grade/components/GradeEntryForm';

const GradeEntryPage: React.FC = () => {
  return (
    <IonPage>
      <GradeEntryForm />
    </IonPage>
  );
};

export default GradeEntryPage;
