import React from 'react';
import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
} from '@ionic/react';
import { Grade } from '@/db/entities';
import { decimalToPercentage } from '@/utils/validation';

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
  const weightPercentage = decimalToPercentage(grade.weight);

  return (
    <IonItemSliding key={index}>
      <IonItem>
        <IonLabel>
          <h2>Titel: {grade.exam.name}</h2>
          <p>Note: {grade.score}</p>
          <p>Gewichtung: {weightPercentage}%</p>
          <p>Datum: {new Date(grade.date).toLocaleDateString()}</p>
          {/*<p>Zählt: {grade.counts ? 'Ja' : 'Nein'}</p>*/}
          <p>Kommentar: {grade.comment}</p>
          <p>Fach: {grade.exam.subject.name}</p>
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
