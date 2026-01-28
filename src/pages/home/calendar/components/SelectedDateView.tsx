import React from 'react';
import { IonCard, IonIcon } from '@ionic/react';
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
    <IonCard className="selected-date-section">
      <IonCard className="date-header" color={'light'}>
        <h3>{format(selectedDate, 'EEEE, d. MMMM', { locale: de })}</h3>
        <span className={isDateToday(selectedDate) ? 'today-badge' : ''}>
          {isDateToday(selectedDate) ? 'Heute' : ''}
        </span>
      </IonCard>

      {events.length > 0 ? (
        <IonCard className="events-list">
          {events.map((exam) => (
            <EventItem key={exam.id} exam={exam} onSelect={onSelectExam} />
          ))}
        </IonCard>
      ) : (
        <IonCard className="no-events" color={'light'}>
          <IonIcon icon={school} size="large" />
          <p>Keine Prüfungen an diesem Tag</p>
        </IonCard>
      )}
    </IonCard>
  );
};

export default SelectedDateView;
