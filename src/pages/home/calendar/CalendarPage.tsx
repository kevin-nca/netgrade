import React, { useState } from 'react';
import { IonCard, IonContent, IonPage } from '@ionic/react';
import { isSameDay } from 'date-fns';
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar/dist/cjs/shared/types';
import Header from '@/components/Header/Header';
import './calendar.css';
import { Exam } from '@/db/entities/Exam';
import { useExams } from '@/hooks/queries';
import { Routes } from '@/routes';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: allExams = [], error, isLoading } = useExams();
  const upcomingExams = allExams.filter((exam) => !exam.isCompleted);

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

  const eventsForSelectedDate = selectedDate
    ? upcomingExams.filter((event: Exam) => isSameDay(event.date, selectedDate))
    : [];

  const tileClassName = ({ date }: { date: Date }): string => {
    const hasEvent = upcomingExams.some((event: Exam) =>
      isSameDay(event.date, date),
    );
    return hasEvent ? 'event-day' : '';
  };

  const tileContent = ({ date }: { date: Date }): React.ReactNode => {
    const hasEvent = upcomingExams.some((event: Exam) =>
      isSameDay(event.date, date),
    );
    return hasEvent ? <div className="event-dot"></div> : null;
  };

  return (
    <IonPage>
      <Header title={'Kalender'} backButton={true} defaultHref={Routes.HOME} />
      <IonContent fullscreen>
        {isLoading ? (
          <div className="ion-padding ion-text-center">
            <p>Kalender wird geladen...</p>
          </div>
        ) : error ? (
          <div className="ion-padding ion-text-center">
            <p>Fehler beim Laden des Kalenders.</p>
          </div>
        ) : (
          <>
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
                    {eventsForSelectedDate.map((event: Exam) => (
                      <li key={event.id}>{event.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Keine Tests an diesem Datum.</p>
                )}
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;
