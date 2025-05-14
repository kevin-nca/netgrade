import React from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface MonthSelectorProps {
  currentMonth: Date;
  onChangeMonth: (direction: 'prev' | 'next') => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  onChangeMonth,
}) => {
  return (
    <div className="month-selector">
      <button
        className="month-button prev"
        onClick={() => onChangeMonth('prev')}
        aria-label="Vorheriger Monat"
      >
        <IonIcon icon={chevronBack} />
      </button>
      <h2 className="current-month-title">
        {format(currentMonth, 'MMMM yyyy', { locale: de })}
      </h2>
      <button
        className="month-button next"
        onClick={() => onChangeMonth('next')}
        aria-label="Nächster Monat"
      >
        <IonIcon icon={chevronForward} />
      </button>
    </div>
  );
};

export default MonthSelector;
