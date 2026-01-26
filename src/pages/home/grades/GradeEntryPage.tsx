import React from 'react';
import { IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import GradeEntryForm from '@/features/enter-grade/grade-entry-form';
import { Routes } from '@/routes';

const GradeEntryPage: React.FC = () => {
  const history = useHistory();
  const { subjectId } = useParams<{ subjectId: string }>();

  const handleAddGrade = () => {
    history.push(Routes.GRADES_ADD);
  };

  return (
    <IonPage>
      <GradeEntryForm subjectId={subjectId} onAddGrade={handleAddGrade} />
    </IonPage>
  );
};

export default GradeEntryPage;
