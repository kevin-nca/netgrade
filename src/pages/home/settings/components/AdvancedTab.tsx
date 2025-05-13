import React, { useState } from 'react';
import { trashOutline, downloadOutline } from 'ionicons/icons';
import { IonText } from '@ionic/react';
import SettingsHeader from './SettingsHeader';
import SettingsGroup from './SettingsGroup';
import SettingsItem from './SettingsItem';
import { ExportDialog } from '@/components/Export/ExportDialog';

interface AdvancedTabProps {
  onReset: () => void;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({ onReset }) => {
  const [showExportDialog, setShowExportDialog] = useState(false);

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
          icon={downloadOutline}
          label="Daten exportieren"
          onClick={() => setShowExportDialog(true)}
        />
        <SettingsItem
          icon={trashOutline}
          label="Alle Daten zurücksetzen"
          onClick={onReset}
          color="danger"
        />
      </SettingsGroup>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </>
  );
};

export default AdvancedTab;
