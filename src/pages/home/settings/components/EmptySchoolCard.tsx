import { IonIcon } from '@ionic/react';
import { schoolOutline } from 'ionicons/icons';
import './EmptySchoolCard.css';

const EmptySchoolCard = () => {
  return (
    <div className="settings-item glass-card empty-item">
      <div className="item-content">
        <div className="item-icon empty">
          <IonIcon icon={schoolOutline} />
        </div>
        <div className="item-text">
          <h3 className="item-title">Keine Schulen</h3>
          <p className="item-subtitle">
            Tippe auf + um eine Schule hinzuzufügen
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptySchoolCard;
