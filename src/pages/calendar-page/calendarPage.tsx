import React, { useState } from 'react';
import { IonCard, IonContent, IonPage } from '@ionic/react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Calendar from 'react-calendar';
import { Value } from 'react-calendar/dist/cjs/shared/types';
import Header from '@/components/Header/Header';
import './calendar.css';

interface TestEvent {
  date: string;
  title: string;
}

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const exams = useSelector((state: RootState) => state.exams.exams || []);

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      value[0] instanceof Date
    ) {
      setSelectedDate(value[0]);
    } else {
      setSelectedDate(null);
    }
  };

  const formattedSelectedDate = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : null;

  const eventsForSelectedDate = exams.filter(
    (event: TestEvent) => event.date === formattedSelectedDate,
  );

  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const hasEvent = exams.some(
      (event: TestEvent) => event.date === formattedDate,
    );
    return hasEvent ? 'test-day' : '';
  };

  const tileContent = ({ date }: { date: Date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const hasEvent = exams.some(
      (event: TestEvent) => event.date === formattedDate,
    );
    return hasEvent ? <div className="event-dot"></div> : null;
  };

  return (
    <IonPage>
      <Header title={'Kalender'} backButton={true} defaultHref={'/main/home'} />
      <IonContent fullscreen>
        <IonCard className="calendar-card">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName={tileClassName}
            tileContent={tileContent}
          />
        </IonCard>
        {selectedDate && (
          <div className="selected-date-info">
            <h3>Ausgewähltes Datum:</h3>
            <p>{selectedDate.toLocaleDateString()}</p>
            {eventsForSelectedDate.length > 0 ? (
              <ul>
                {eventsForSelectedDate.map((event, index) => (
                  <li key={index}>{event.title}</li>
                ))}
              </ul>
            ) : (
              <p>Keine Tests an diesem Datum.</p>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;
