import React, { useState } from 'react';
import { trashOutline, downloadOutline } from 'ionicons/icons';
import { IonText, IonItem, IonIcon, IonLabel } from '@ionic/react';
import SettingsHeader from './SettingsHeader';
import SettingsGroup from './SettingsGroup';
import SettingsItem from './SettingsItem';
import { ExportDialog } from '@/components/export/ExportDialog';
import { School } from '@/db/entities';

interface AdvancedTabProps {
  onReset: () => void;
  school: School;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({ onReset, school }) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

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
        <IonItem button onClick={() => setIsExportDialogOpen(true)}>
          <IonIcon icon={downloadOutline} slot="start" />
          <IonLabel>Daten exportieren</IonLabel>
        </IonItem>
        <SettingsItem
          icon={trashOutline}
          label="Alle Daten zurücksetzen"
          onClick={onReset}
          color="danger"
        />
      </SettingsGroup>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        school={school}
      />
    </>
  );
};

export default AdvancedTab;
