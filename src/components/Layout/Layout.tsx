import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useIonRouter } from '@ionic/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useIonRouter();

  return (
    <IonPage>
      <IonContent
        className="ion-padding"
        scrollY={false}
        style={{
          '--padding-top': '16px',
          '--padding-bottom': '16px',
          '--padding-start': '16px',
          '--padding-end': '16px',
          '--background': 'var(--ion-color-light)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {children}
        </div>
      </IonContent>
    </IonPage>
  );
};
