import React from 'react';
import { IonText, IonGrid, IonRow, IonCol } from '@ionic/react';

interface SettingsHeaderProps {
  title: string;
  subtitle?: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, subtitle }) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <IonText>
            <h1>{title}</h1>
          </IonText>
          {subtitle && (
            <IonText>
              <p>{subtitle}</p>
            </IonText>
          )}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default SettingsHeader;
