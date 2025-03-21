import React from 'react';
import { IonInput, IonItem, IonLabel } from '@ionic/react';
import { Grade } from '@/store/gradesSlice';

interface GradeFormProps {
  updatedGrade: Grade;
  setUpdatedGrade: (value: Grade) => void;
}

const GradeForm: React.FC<GradeFormProps> = ({
  updatedGrade,
  setUpdatedGrade,
}) => {
  return (
    <>
      <IonItem>
        <IonLabel>Titel:</IonLabel>
        <IonInput
          value={updatedGrade.examName}
          onIonChange={(e) =>
            setUpdatedGrade({ ...updatedGrade, examName: e.detail.value! })
          }
        />
      </IonItem>
    </>
  );
};

export default GradeForm;
