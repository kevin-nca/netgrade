import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonInput,
  IonButton,
  IonText,
  IonAlert,
} from '@ionic/react';
import { useExport } from '@/hooks/useExports';
import { School } from '@/db/entities';
import { ExportOptions } from '@/services/DataManagementService';
import { saveOrShareExportedFile } from '@/services/FileExportService';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
}

export function ExportDialog({ isOpen, onClose, school }: ExportDialogProps) {
  const { exportData, isExporting, error } = useExport();
  const [format, setFormat] = useState<ExportOptions['format']>('xlsx');
  const [filename, setFilename] = useState('');
  const [showError, setShowError] = useState(false);

  const handleExport = async () => {
    try {
      const blob = await exportData(school, {
        format,
        filename: filename || undefined,
        includeSummaries: true,
      });
      await saveOrShareExportedFile(
        blob,
        filename || `netgrade-export-${new Date().toISOString()}.${format}`,
        format
      );
      onClose();
    } catch (exportError) {
      setShowError(true);
      console.error('Export failed:', exportError);
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Export School Data</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="medium">
            <p>
              Export your school data including subjects, exams, grades, and
              summary statistics.
            </p>
          </IonText>

          <IonList>
            <IonItem>
              <IonLabel>Export Format</IonLabel>
            </IonItem>
            <IonRadioGroup
              value={format}
              onIonChange={(e) =>
                setFormat(e.detail.value as ExportOptions['format'])
              }
            >
              <IonItem>
                <IonLabel>Excel (XLSX)</IonLabel>
                <IonRadio slot="start" value="xlsx" />
              </IonItem>
              <IonItem>
                <IonLabel>CSV</IonLabel>
                <IonRadio slot="start" value="csv" />
              </IonItem>
              <IonItem>
                <IonLabel>JSON</IonLabel>
                <IonRadio slot="start" value="json" />
              </IonItem>
            </IonRadioGroup>

            <IonItem>
              <IonLabel position="stacked">Filename (optional)</IonLabel>
              <IonInput
                value={filename}
                onIonChange={(e) => setFilename(e.detail.value || '')}
                placeholder={`school-data.${format}`}
              />
            </IonItem>
          </IonList>

          <div className="ion-padding">
            <IonButton
              expand="block"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={onClose}>
              Cancel
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        header="Export Error"
        message={error || 'An error occurred during export'}
        buttons={['OK']}
      />
    </>
  );
}
