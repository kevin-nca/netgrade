import React from 'react';
import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
} from '@ionic/react';
import { Grade } from '@/store/gradesSlice';

interface GradeListItemProps {
  grade: Grade;
  index?: number;
  onEdit: () => void;
  onDelete: () => void;
}

const GradeListItem: React.FC<GradeListItemProps> = ({
  grade,
  index,
  onEdit,
  onDelete,
}) => {
  return (
    <IonItemSliding key={index}>
      <IonItem>
        <IonLabel>
          <h2>Titel: {grade.examName}</h2>
          <p>Note: {grade.score}</p>
          <p>Gewichtung: {grade.weight}</p>
          <p>Datum: {new Date(grade.date).toLocaleDateString()}</p>
          <p>Zählt: {grade.counts ? 'Ja' : 'Nein'}</p>
          <p>Kommentar: {grade.comment}</p>
        </IonLabel>
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="primary" onClick={onEdit}>
          Bearbeiten
        </IonItemOption>
        <IonItemOption color="danger" onClick={onDelete}>
          Löschen
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default GradeListItem;
