import React from 'react';
import { IonList, IonGrid, IonRow, IonCol, IonText } from '@ionic/react';

interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
}

const SettingsGroup: React.FC<SettingsGroupProps> = ({ title, children }) => {
  return (
    <IonGrid>
      {title && (
        <IonRow>
          <IonCol>
            <IonText>{title}</IonText>
          </IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol>
          <IonList>{children}</IonList>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default SettingsGroup;
