import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { happy, calendar, flame } from 'ionicons/icons';

const FlorentAkhiPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Akhi's Special Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={happy} style={{ marginRight: 8 }} />
              Willkommen, Akhi!
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Dies ist deine persönliche Seite. Hier kannst du alles machen, was
            du willst!
          </IonCardContent>
        </IonCard>
        <IonList>
          <IonItem>
            <IonIcon icon={calendar} slot="start" color="primary" />
            <IonLabel>Dein Kalender</IonLabel>
            <IonButton fill="outline" color="secondary">
              Öffnen
            </IonButton>
          </IonItem>
          <IonItem>
            <IonIcon icon={flame} slot="start" color="danger" />
            <IonLabel>Motivation</IonLabel>
            <IonButton fill="solid" color="success">
              Push!
            </IonButton>
          </IonItem>
        </IonList>
        <IonButton expand="block" color="tertiary" style={{ marginTop: 24 }}>
          Mach was du willst, Bruder!
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default FlorentAkhiPage;
