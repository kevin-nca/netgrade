import { IonIcon } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';

const EmptySemesterCard = () => {
  return (
    <div className="settings-item glass-card empty-item">
      <div className="item-content">
        <div className="item-icon empty">
          <IonIcon icon={calendarOutline} />
        </div>
        <div className="item-text">
          <h3 className="item-title">Keine Semester</h3>
          <p className="item-subtitle">
            Tippe auf + um ein Semester hinzuzufügen
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptySemesterCard;
