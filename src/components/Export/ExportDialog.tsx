import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonRadioGroup,
  IonRadio,
  IonButton,
  IonButtons,
  IonIcon,
  IonLoading,
  IonToast,
  IonCard,
  IonCardContent,
  IonText,
} from '@ionic/react';
import { close, downloadOutline } from 'ionicons/icons';
import { useExportData } from '@/hooks/queries/useDataManagementQueries';
import { ExportFormat } from '@/services/DataManagementService';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ onClose }) => {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [includeSchools, setIncludeSchools] = useState(true);
  const [includeSubjects, setIncludeSubjects] = useState(true);
  const [includeExams, setIncludeExams] = useState(true);
  const [includeGrades, setIncludeGrades] = useState(true);
  const [showError, setShowError] = useState(false);
  const exportMutation = useExportData();

  const handleExport = async () => {
    try {
      const data = await exportMutation.mutateAsync({
        format,
        includeSchools,
        includeSubjects,
        includeExams,
        includeGrades,
      });

      let blob: Blob;
      let filename: string;

      if (format === 'xlsx') {
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        filename = 'export.xlsx';
      } else {
        const mimeType = format === 'json' ? 'application/json' : 'text/csv';
        blob = new Blob([data], { type: mimeType });
        filename = `export.${format}`;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setShowError(true);
    }
  };

  return (
    <IonContent>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Daten exportieren</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonCard>
        <IonCardContent>
          <IonText>
            <h2>Format</h2>
          </IonText>
          <IonRadioGroup
            value={format}
            onIonChange={(e) => setFormat(e.detail.value as ExportFormat)}
          >
            <IonItem>
              <IonLabel>JSON</IonLabel>
              <IonRadio value="json" />
            </IonItem>
            <IonItem>
              <IonLabel>CSV</IonLabel>
              <IonRadio value="csv" />
            </IonItem>
            <IonItem>
              <IonLabel>Excel (XLSX)</IonLabel>
              <IonRadio value="xlsx" />
            </IonItem>
          </IonRadioGroup>

          <IonText>
            <h2>Daten auswählen</h2>
          </IonText>
          <IonList>
            <IonItem>
              <IonLabel>Schulen</IonLabel>
              <IonCheckbox
                checked={includeSchools}
                onIonChange={(e) => setIncludeSchools(e.detail.checked)}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Fächer</IonLabel>
              <IonCheckbox
                checked={includeSubjects}
                onIonChange={(e) => setIncludeSubjects(e.detail.checked)}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Klausuren</IonLabel>
              <IonCheckbox
                checked={includeExams}
                onIonChange={(e) => setIncludeExams(e.detail.checked)}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Noten</IonLabel>
              <IonCheckbox
                checked={includeGrades}
                onIonChange={(e) => setIncludeGrades(e.detail.checked)}
              />
            </IonItem>
          </IonList>

          <IonButton
            expand="block"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <IonIcon icon={downloadOutline} slot="start" />
            Exportieren
          </IonButton>
        </IonCardContent>
      </IonCard>

      <IonLoading
        isOpen={exportMutation.isPending}
        message="Daten werden exportiert..."
      />

      <IonToast
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        message="Export fehlgeschlagen. Bitte versuchen Sie es erneut."
        color="danger"
        duration={3000}
      />
    </IonContent>
  );
};

export default ExportDialog;
