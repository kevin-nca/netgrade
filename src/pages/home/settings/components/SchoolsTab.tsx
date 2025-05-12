import React from 'react';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { addOutline, schoolOutline } from 'ionicons/icons';

import SettingsHeader from './SettingsHeader';
import SettingsGroup from './SettingsGroup';

interface SchoolsTabProps {
  schools: { id: string; name: string }[];
  onAddSchool: () => void;
}

const SchoolsTab: React.FC<SchoolsTabProps> = ({ schools, onAddSchool }) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <SettingsHeader
            title="Schulverwaltung"
            subtitle="Verwalten Sie Ihre Schulen"
          />
        </IonCol>
      </IonRow>

      <IonRow>
        <IonCol>
          <IonButton expand="block" onClick={onAddSchool}>
            <IonIcon icon={addOutline} slot="start" />
            Neue Schule hinzufügen
          </IonButton>
        </IonCol>
      </IonRow>

      <IonRow>
        <IonCol>
          <SettingsGroup>
            {schools.length > 0 ? (
              schools.map((school) => (
                <IonItem key={school.id}>
                  <IonIcon icon={schoolOutline} slot="start" />
                  <IonLabel>
                    <IonText>
                      <strong>{school.name}</strong>
                    </IonText>
                  </IonLabel>
                </IonItem>
              ))
            ) : (
              <IonItem lines="none">
                <IonLabel>
                  <IonText>
                    <strong>Keine Schulen vorhanden</strong>
                  </IonText>
                </IonLabel>
              </IonItem>
            )}
          </SettingsGroup>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default SchoolsTab;
