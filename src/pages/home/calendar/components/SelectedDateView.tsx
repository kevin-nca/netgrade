import React from 'react';
import { IonIcon } from '@ionic/react';
import { school } from 'ionicons/icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Exam } from '@/db/entities/Exam';
import EventItem from './EventItem';

interface SelectedDateViewProps {
  selectedDate: Date;
  events: Exam[];
  onSelectExam: (exam: Exam) => void;
}

const SelectedDateView: React.FC<SelectedDateViewProps> = ({
  selectedDate,
  events,
  onSelectExam,
}) => {
  const isDateToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="selected-date-section">
      <div className="date-header">
        <h3>{format(selectedDate, 'EEEE, d. MMMM', { locale: de })}</h3>
        <span className={isDateToday(selectedDate) ? 'today-badge' : ''}>
          {isDateToday(selectedDate) ? 'Heute' : ''}
        </span>
      </div>

      {events.length > 0 ? (
        <div className="events-list">
          {events.map((exam) => (
            <EventItem key={exam.id} exam={exam} onSelect={onSelectExam} />
          ))}
        </div>
      ) : (
        <div className="no-events">
          <div className="no-events-icon">
            <IonIcon icon={school} />
          </div>
          <p>Keine Prüfungen an diesem Tag</p>
        </div>
      )}
    </div>
  );
};

export default SelectedDateView;
