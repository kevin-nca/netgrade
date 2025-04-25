import React from 'react';
import { settingsOutline, saveOutline, trashOutline } from 'ionicons/icons';

import SettingsHeader from './SettingsHeader';
import SettingsGroup from './SettingsGroup';
import SettingsItem from './SettingsItem';

interface AdvancedTabProps {
  onSave: () => void;
  onReset: () => void;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({ onSave, onReset }) => {
  return (
    <div className="settings-section">
      <SettingsHeader
        title="Erweiterte Einstellungen"
        subtitle="Zurücksetzen und Systemeinstellungen"
      />

      <SettingsGroup>
        <SettingsItem
          icon={settingsOutline}
          label="App Konfiguration"
          detail={true}
        />

        <SettingsItem
          icon={saveOutline}
          label="Einstellungen speichern"
          detail={true}
          onClick={onSave}
        />
      </SettingsGroup>

      <SettingsGroup title="Gefahrenzone" isDanger>
        <SettingsItem
          icon={trashOutline}
          label="Alle Daten zurücksetzen"
          onClick={onReset}
          color="danger"
        />
      </SettingsGroup>
    </div>
  );
};

export default AdvancedTab;
