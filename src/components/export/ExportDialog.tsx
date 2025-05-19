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
import { useExportData } from '@/hooks/queries/useExportQueries';
import { ExportFormat } from '@/services/DataManagementService';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [includeSchools, setIncludeSchools] = useState(true);
  const [includeSubjects, setIncludeSubjects] = useState(true);
  const [includeExams, setIncludeExams] = useState(true);
  const [includeGrades, setIncludeGrades] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `netgrade-export-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
    } catch (error) {
      setToastMessage('Export fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setShowToast(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="ion-text-center">Daten exportieren</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} fill="clear">
              <IonIcon icon={close} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard className="ion-no-margin">
          <IonCardContent>
            <IonText color="medium" className="ion-padding-bottom">
              <p>
                Wählen Sie das Format und die Daten aus, die Sie exportieren
                möchten.
              </p>
            </IonText>

            <IonList lines="none" className="ion-padding-vertical">
              <IonItem className="ion-margin-bottom">
                <IonLabel className="ion-text-wrap">
                  <h2>Format</h2>
                  <IonRadioGroup
                    value={format}
                    onIonChange={(e) => setFormat(e.detail.value)}
                    className="ion-margin-top"
                  >
                    <IonItem lines="none">
                      <IonLabel>JSON</IonLabel>
                      <IonRadio value="json" />
                    </IonItem>
                    <IonItem lines="none">
                      <IonLabel>CSV</IonLabel>
                      <IonRadio value="csv" />
                    </IonItem>
                  </IonRadioGroup>
                </IonLabel>
              </IonItem>

              <IonItem className="ion-margin-bottom">
                <IonLabel className="ion-text-wrap">
                  <h2>Daten auswählen</h2>
                  <div className="ion-margin-top">
                    <IonItem lines="none">
                      <IonLabel>Schulen</IonLabel>
                      <IonCheckbox
                        checked={includeSchools}
                        onIonChange={(e) => setIncludeSchools(e.detail.checked)}
                      />
                    </IonItem>
                    <IonItem lines="none">
                      <IonLabel>Fächer</IonLabel>
                      <IonCheckbox
                        checked={includeSubjects}
                        onIonChange={(e) =>
                          setIncludeSubjects(e.detail.checked)
                        }
                      />
                    </IonItem>
                    <IonItem lines="none">
                      <IonLabel>Prüfungen</IonLabel>
                      <IonCheckbox
                        checked={includeExams}
                        onIonChange={(e) => setIncludeExams(e.detail.checked)}
                      />
                    </IonItem>
                    <IonItem lines="none">
                      <IonLabel>Noten</IonLabel>
                      <IonCheckbox
                        checked={includeGrades}
                        onIonChange={(e) => setIncludeGrades(e.detail.checked)}
                      />
                    </IonItem>
                  </div>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <div className="ion-padding">
          <IonButton
            expand="block"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="ion-margin-top"
          >
            <IonIcon icon={downloadOutline} slot="start" />
            Exportieren
          </IonButton>
        </div>
      </IonContent>

      <IonLoading
        isOpen={exportMutation.isPending}
        message="Daten werden exportiert..."
      />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
        color="danger"
      />
    </>
  );
};
