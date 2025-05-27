import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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
    <div className="modern-calendar">
      <div className="calendar-weekdays">
        {weekdays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={`week-${weekIndex}`} className="calendar-week">
          {week.map((day) => (
            <button
              key={format(day.date, 'yyyy-MM-dd')}
              className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isSelected ? 'selected' : ''} ${day.isToday ? 'today' : ''} ${day.hasExam ? 'has-exam' : ''}`}
              onClick={() => day.isCurrentMonth && onSelectDate(day.date)}
              disabled={!day.isCurrentMonth}
              type="button"
              aria-label={format(day.date, 'd MMMM', { locale: de })}
              aria-selected={day.isSelected}
            >
              <span className="day-number">{format(day.date, 'd')}</span>
              {day.hasExam && <div className="exam-dot"></div>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;
