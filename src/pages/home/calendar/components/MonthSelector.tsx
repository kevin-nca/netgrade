import React from 'react';
import { IonCard, IonIcon, IonButton } from '@ionic/react';
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
    <IonCard className="month-selector" color={'light'}>
      <IonButton
        shape="round"
        size="small"
        className="month-button prev"
        onClick={() => onChangeMonth('prev')}
        aria-label="Vorheriger Monat"
      >
        <IonIcon slot="icon-only" icon={chevronBack} />
      </IonButton>
      <h2 className="current-month-title">
        {format(currentMonth, 'MMMM yyyy', { locale: de })}
      </h2>
      <IonButton
        shape="round"
        size="small"
        className="month-button next"
        onClick={() => onChangeMonth('next')}
        aria-label="Nächster Monat"
      >
        <IonIcon slot="icon-only" icon={chevronForward} />
      </IonButton>
    </IonCard>
  );
};

export default MonthSelector;
