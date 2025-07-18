import React from 'react';
import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { Grade } from '@/db/entities';
import { decimalToPercentage } from '@/utils/validation';
import {
  trophyOutline,
  scaleOutline,
  calendarOutline,
  chatbubbleOutline,
} from 'ionicons/icons';
import './GradeListItem.css';

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
          <div className="grade-card">
            <div className="grade-card__badge">{grade.exam.name}</div>
            <div className="grade-row">
              <IonIcon
                icon={trophyOutline}
                className="grade-row__icon grade-row__icon--note"
              />
              <div className="grade-row__content">
                <span className="grade-row__label">Note:</span>
                <span className="grade-row__value">{grade.score}</span>
              </div>
            </div>
            <div className="grade-row">
              <IonIcon
                icon={scaleOutline}
                className="grade-row__icon grade-row__icon--weight"
              />
              <div className="grade-row__content">
                <span className="grade-row__label">Gewichtung:</span>
                <span className="grade-row__value">{weightPercentage}%</span>
              </div>
            </div>
            <div className="grade-row">
              <IonIcon
                icon={calendarOutline}
                className="grade-row__icon grade-row__icon--date"
              />
              <div className="grade-row__content">
                <span className="grade-row__label">Datum:</span>
                <span className="grade-row__value">
                  {new Date(grade.date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="grade-row">
              <IonIcon
                icon={chatbubbleOutline}
                className="grade-row__icon grade-row__icon--comment"
              />
              <div className="grade-row__content">
                <span className="grade-row__label">Kommentar:</span>
                <span className="grade-row__value">
                  {grade.comment && grade.comment.trim() ? (
                    grade.comment
                  ) : (
                    <span style={{ color: '#bbb', fontStyle: 'italic' }}>
                      Kein Kommentar vorhanden
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
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
