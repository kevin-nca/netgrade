import React from 'react';
import { IonCard, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Exam } from '@/db/entities';
import { Routes } from '@/routes';

const ExamCard: React.FC<{ exam: Exam }> = ({ exam }) => {
  const history = useHistory();

  const handleEdit = () => {
    history.push(Routes.EXAM_EDIT.replace(':examId', exam.id));
  };

  return (
    <IonCard className="grade-card" onClick={handleEdit}>
      <IonItem button detail>
        <IonLabel>{exam.name}</IonLabel>
        <IonLabel slot="end" className="grade-average">
          {exam.date.toLocaleDateString()}
        </IonLabel>
      </IonItem>
    </IonCard>
  );
};

export default ExamCard;
