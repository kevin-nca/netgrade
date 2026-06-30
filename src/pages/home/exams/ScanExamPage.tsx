import React from 'react';
import { IonPage } from '@ionic/react';
import ScanExamForm from '@/features/scan-exam/scan-exam-form';

const ScanExamPage: React.FC = () => {
  return (
    <IonPage>
      <ScanExamForm />
    </IonPage>
  );
};

export default ScanExamPage;
