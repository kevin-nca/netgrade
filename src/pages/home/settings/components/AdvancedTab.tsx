import React from 'react';
import { trashOutline } from 'ionicons/icons';
import { IonText } from '@ionic/react';
import SettingsHeader from './SettingsHeader';
import SettingsGroup from './SettingsGroup';
import SettingsItem from './SettingsItem';

interface AdvancedTabProps {
  onReset: () => void;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({ onReset }) => {
  return (
    <>
      <SettingsHeader
        title="Erweiterte Einstellungen"
        subtitle="Daten verwalten und exportieren"
      />
      <SettingsGroup>
        <IonText color="medium" className="ion-padding-horizontal">
          <p>Hier können Sie Ihre Daten exportieren oder zurücksetzen.</p>
        </IonText>
        <SettingsItem
          icon={trashOutline}
          label="Alle Daten zurücksetzen"
          onClick={onReset}
          color="danger"
        />
      </SettingsGroup>
    </>
  );
};

export default AdvancedTab;
