import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { IonButton, IonCard } from '@ionic/react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasExam: boolean;
}

interface CalendarGridProps {
  calendarData: CalendarDay[];
  onSelectDate: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarData,
  onSelectDate,
}) => {
  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <IonCard className="modern-calendar" color={'light'}>
      <IonCard className="calendar-weekdays" color={'light'}>
        {weekdays.map((day) => (
          <p key={day} className="calendar-weekday">
            {day}
          </p>
        ))}
      </IonCard>
      {weeks.map((week, weekIndex) => (
        <IonCard
          key={`week-${weekIndex}`}
          className="calendar-week"
          color={'light'}
        >
          {week.map((day) => (
            <IonButton
              size="small"
              shape="round"
              key={format(day.date, 'yyyy-MM-dd')}
              className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isSelected ? 'selected' : ''} ${day.isToday ? 'today' : ''} ${day.hasExam ? 'has-exam' : ''}`}
              onClick={() => day.isCurrentMonth && onSelectDate(day.date)}
              disabled={!day.isCurrentMonth}
              aria-label={format(day.date, 'd MMMM', { locale: de })}
              aria-selected={day.isSelected}
            >
              <span className="day-number">{format(day.date, 'd')}</span>
              {day.hasExam && <div className="exam-dot"></div>}
            </IonButton>
          ))}
        </IonCard>
      ))}
    </IonCard>
  );
};

export default CalendarGrid;
