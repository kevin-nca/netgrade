import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonButton,
  IonButtons,
  IonIcon,
  IonToast,
  IonCard,
  IonCardContent,
  IonText,
  IonLoading,
  IonModal,
} from '@ionic/react';
import { close, downloadOutline, shareOutline } from 'ionicons/icons';
import { useExportData } from '@/hooks/queries/useDataManagementQueries';
import { useUserName } from '@/hooks';
import { useSchools } from '@/hooks/queries/useSchoolQueries';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { School } from '@/db/entities';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school?: School;
}

interface ToastState {
  show: boolean;
  message: string;
  color: 'success' | 'danger' | 'warning';
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  school,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    color: 'danger',
  });

  const exportMutation = useExportData();
  const { data: userName } = useUserName();
  const { data: schools } = useSchools();

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (school) {
      setSelectedSchoolId(school.id);
    }
  }, [school]);

  const showToast = (
    message: string,
    color: ToastState['color'] = 'danger',
  ) => {
    setToast({ show: true, message, color });
  };

  const generateFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const username = userName ? `${userName}-` : '';
    const selectedSchool = schools?.find((s) => s.id === selectedSchoolId);
    const schoolName = selectedSchool?.name ? `${selectedSchool.name}-` : '';
    return `netgrade-${schoolName}${username}${timestamp}.xlsx`;
  };

  const downloadFileWeb = (data: Blob, filename: string) => {
    try {
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Export erfolgreich heruntergeladen.', 'success');
      onClose();
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Download fehlgeschlagen.');
    }
  };

  const saveFileAndShare = async (data: Blob, filename: string) => {
    try {
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Clean = base64.split(',')[1];
          resolve(base64Clean);
        };
        reader.onerror = reject;
        reader.readAsDataURL(data);
      });

      const properFilename = filename.endsWith('.xlsx')
        ? filename
        : `${filename}.xlsx`;

      await Filesystem.writeFile({
        path: properFilename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
        encoding: undefined, // Binary data
      });

      console.log(`File saved: ${properFilename}`);

      const fileInfo = await Filesystem.stat({
        path: properFilename,
        directory: Directory.Documents,
      });

      console.log('File info:', fileInfo);

      const fileUri = await Filesystem.getUri({
        path: properFilename,
        directory: Directory.Documents,
      });

      console.log('File URI:', fileUri.uri);

      await Share.share({
        title: 'NetGrade Export',
        text: 'NetGrade-Datenexport als Excel-Datei.',
        url: fileUri.uri,
        dialogTitle: 'NetGrade Export teilen',
      });

      showToast('Datei erfolgreich geteilt.', 'success');
      onClose();
    } catch (error) {
      console.error('Share failed:', error);

      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });

        if (
          error.message.includes('cancelled') ||
          error.message.includes('canceled')
        ) {
          showToast('Vorgang abgebrochen. Datei wurde gespeichert.', 'warning');
        } else if (
          error.message.includes('file') ||
          error.message.includes('File')
        ) {
          showToast(
            'Datei konnte nicht geöffnet werden. Versuchen Sie es erneut.',
            'warning',
          );
        } else {
          showToast(
            'Datei wurde gespeichert, Teilen war nicht möglich.',
            'warning',
          );
        }
      } else {
        showToast('Unbekannter Fehler beim Teilen.', 'warning');
      }
      onClose();
    }
  };

  const handleExport = async () => {
    if (!selectedSchoolId) {
      showToast('Bitte wählen Sie eine Schule aus.');
      return;
    }

    try {
      const filename = generateFilename();

      const result = await exportMutation.mutateAsync({
        options: {
          format: 'xlsx',
          filename,
          schoolId: selectedSchoolId,
        },
      });

      if (!isNative) {
        downloadFileWeb(result, filename);
      } else {
        await saveFileAndShare(result, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      showToast(
        error instanceof Error
          ? `Export fehlgeschlagen: ${error.message}`
          : 'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
      );
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
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
                  Wählen Sie die Schule aus, deren Daten Sie exportieren
                  möchten.
                  {!isNative && ' Die Datei wird direkt heruntergeladen.'}
                  {isNative &&
                    ' Nach dem Export können Sie die Datei über die verfügbaren Apps teilen.'}
                </p>
              </IonText>

              <IonList lines="none" className="ion-padding-vertical">
                <IonItem className="ion-margin-bottom">
                  <IonLabel className="ion-text-wrap">
                    <h2>Schule</h2>
                    <IonRadioGroup
                      value={selectedSchoolId}
                      onIonChange={(e) => setSelectedSchoolId(e.detail.value)}
                      className="ion-margin-top"
                    >
                      {schools?.map((school) => (
                        <IonItem key={school.id} lines="none">
                          <IonLabel>{school.name}</IonLabel>
                          <IonRadio value={school.id} />
                        </IonItem>
                      ))}
                    </IonRadioGroup>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          <div className="ion-padding">
            <IonButton
              expand="block"
              onClick={handleExport}
              disabled={exportMutation.isPending || !selectedSchoolId}
              className="ion-margin-top"
            >
              <IonIcon
                icon={isNative ? shareOutline : downloadOutline}
                slot="start"
              />
              {isNative ? 'Exportieren und teilen' : 'Herunterladen'}
            </IonButton>
          </div>

          {isNative && (
            <IonCard className="ion-margin-top">
              <IonCardContent>
                <IonText color="primary">
                  <h3>Verfügbare Optionen</h3>
                  <p>
                    Das System zeigt automatisch alle verfügbaren
                    Sharing-Optionen an:
                  </p>
                  <ul className="ion-margin-start">
                    <li>
                      <strong>AirDrop:</strong> Direkte Übertragung zu anderen
                      Apple-Geräten
                    </li>
                    <li>
                      <strong>E-Mail & Nachrichten:</strong> Versand als
                      Dateianhang
                    </li>
                    <li>
                      <strong>Messenger-Apps:</strong> WhatsApp, Telegram,
                      Signal
                    </li>
                    <li>
                      <strong>Cloud-Dienste:</strong> iCloud, Dropbox, Google
                      Drive
                    </li>
                    <li>
                      <strong>Andere Apps:</strong> Alle installierten Apps mit
                      Excel-Unterstützung
                    </li>
                  </ul>
                </IonText>
              </IonCardContent>
            </IonCard>
          )}

          {!isNative && (
            <IonCard className="ion-margin-top">
              <IonCardContent>
                <IonText color="warning">
                  <p>
                    <strong>Hinweis:</strong> Im Webbrowser wird die Datei
                    direkt heruntergeladen. Erweiterte Sharing-Funktionen sind
                    nur in der mobilen App verfügbar.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          )}
        </IonContent>

        <IonLoading
          isOpen={exportMutation.isPending}
          message="Export wird durchgeführt..."
        />
      </IonModal>

      <IonToast
        isOpen={toast.show}
        onDidDismiss={() => setToast({ ...toast, show: false })}
        message={toast.message}
        duration={3000}
        position="bottom"
        color={toast.color}
      />
    </>
  );
};
