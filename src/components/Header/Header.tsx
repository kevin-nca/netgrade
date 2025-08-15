import React, { ReactNode } from 'react';
import './Header.css';
import {
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

interface HeaderProps {
  title: string;
  backButton?: boolean;
  endSlot?: ReactNode;
  defaultHref?: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, backButton, endSlot }) => {
  const history = useHistory();

  const handleBackClick = () => {
    history.goBack();
  };

  return (
    <IonHeader>
      <IonToolbar>
        {backButton && (
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              onClick={handleBackClick}
              className="back-button"
            >
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
        )}

        <IonTitle>{title}</IonTitle>

        {endSlot && endSlot}
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
