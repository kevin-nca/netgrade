import React from 'react';
import { trashOutline } from 'ionicons/icons';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import SettingsHeader from './SettingsHeader';
import SettingsGroup from './SettingsGroup';
import SettingsItem from './SettingsItem';

interface AdvancedTabProps {
  onReset: () => void;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({ onReset }) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <SettingsHeader
            title="Erweiterte Einstellungen"
            subtitle="Daten zurücksetzen"
          />
        </IonCol>
      </IonRow>

      <IonRow>
        <IonCol>
          <SettingsGroup title="Gefahrenzone">
            <SettingsItem
              icon={trashOutline}
              label="Alle Daten zurücksetzen"
              onClick={onReset}
              color="danger"
            />
          </SettingsGroup>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default AdvancedTab;
