import React from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';

interface SuccessOverlayProps {
  show: boolean;
  title?: string;
  message?: string;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  show,
  title = 'Erfolgreich hinzugefügt!',
  message = 'Die Daten wurden gespeichert',
}) => {
  if (!show) return null;

  return (
    <div className="success-overlay">
      <div className="success-content">
        <IonIcon icon={checkmarkCircleOutline} className="success-icon" />
        <h3 className="success-title">{title}</h3>
        <p className="success-message">{message}</p>
      </div>
    </div>
  );
};

export default SuccessOverlay;
