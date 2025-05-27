import React from 'react';
import { IonIcon } from '@ionic/react';
import { informationCircle } from 'ionicons/icons';
import { Exam } from '@/db/entities/Exam';

interface EventItemProps {
  exam: Exam;
  onSelect: (exam: Exam) => void;
}

const EventItem: React.FC<EventItemProps> = ({ exam, onSelect }) => {
  return (
    <div className="event-item" onClick={() => onSelect(exam)}>
      <div className="event-marker"></div>
      <div className="event-content">
        <h4>{exam.name}</h4>
        {exam.description && (
          <p className="event-description">
            {exam.description.length > 80
              ? `${exam.description.substring(0, 80)}...`
              : exam.description}
          </p>
        )}
      </div>
      <IonIcon icon={informationCircle} className="event-detail-icon" />
    </div>
  );
};

export default EventItem;
