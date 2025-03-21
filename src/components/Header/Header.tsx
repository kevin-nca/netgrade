import React, { ReactNode } from 'react';
import './Header.css';
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

interface HeaderProps {
  title: string;
  backButton?: boolean;
  endSlot?: ReactNode;
  defaultHref?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  backButton,
  endSlot,
  defaultHref,
}) => {
  return (
    <IonHeader>
      <IonToolbar>
        {backButton && (
          <IonButtons slot="start">
            <IonBackButton defaultHref={defaultHref} />
          </IonButtons>
        )}

        <IonTitle>{title}</IonTitle>

        {endSlot && endSlot}
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
