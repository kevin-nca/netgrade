import React from 'react';
import {
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/react';
import { calendar, chatbubble, scale } from 'ionicons/icons';
import { Grade } from '@/db/entities';
import { decimalToPercentage } from '@/utils/validation';
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
    <IonItemSliding key={index} className="grade-sliding-item">
      <div className="grade-item">
        <div className="grade-icon-badge">
          <span className="grade-score">{grade.score}</span>
        </div>

        <div className="grade-info">
          <h3 className="grade-exam-name">{grade.exam.name}</h3>
          <div className="grade-details">
            <div className="grade-detail-item">
              <IonIcon icon={scale} />
              <span>{weightPercentage}%</span>
            </div>
            <div className="grade-detail-item">
              <IonIcon icon={calendar} />
              <span>{new Date(grade.date).toLocaleDateString()}</span>
            </div>
            {grade.comment && (
              <div className="grade-detail-item">
                <IonIcon icon={chatbubble} />
                <span>{grade.comment}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <IonItemOptions side="end" className="grade-options">
        <IonItemOption className="edit-option-slide" onClick={onEdit}>
          Bearbeiten
        </IonItemOption>
        <IonItemOption className="remove-option-slide" onClick={onDelete}>
          Löschen
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default GradeListItem;
