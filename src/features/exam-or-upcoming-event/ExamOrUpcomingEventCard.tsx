// components/ExamOrUpcomingEventCard.tsx
import React from 'react';
import { IonCard, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';

interface Exam {
  id: string;
  title: string;
  date: string;
  subject: string;
  description: string;
}

const ExamOrUpcomingEventCard: React.FC<{ exam: Exam }> = ({ exam }) => {
  const history = useHistory();

  const handleEdit = () => {
    history.replace(`/main/home/${exam.id}/edit`, { exam });
  };

  return (
    <IonCard className="grade-card" onClick={handleEdit}>
      <IonItem button detail>
        <IonLabel>{exam.title}</IonLabel>
        <IonLabel slot="end" className="grade-average">
          {exam.date.slice(0, 10)}
        </IonLabel>
      </IonItem>
    </IonCard>
  );
};

export default ExamOrUpcomingEventCard;
