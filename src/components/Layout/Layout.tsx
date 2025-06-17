import React from 'react';
import { IonContent } from '@ionic/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <IonContent
      className="ion-padding"
      scrollY={false}
      style={{
        '--padding-top': '16px',
        '--padding-bottom': '16px',
        '--padding-start': '16px',
        '--padding-end': '16px',
      }}
    >
      {children}
    </IonContent>
  );
}; 