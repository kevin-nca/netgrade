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
import { close, downloadOutline } from 'ionicons/icons';
import { useExportData } from '@/hooks/queries/useDataManagementQueries';
import { useUserName } from '@/hooks';
import { useSchools } from '@/hooks/queries/useSchoolQueries';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing';
import { Capacitor } from '@capacitor/core';
import { School } from '@/db/entities';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school?: School;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  school,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const exportMutation = useExportData();
  const { data: userName } = useUserName();
  const { data: schools } = useSchools();

  useEffect(() => {
    if (school) {
      setSelectedSchoolId(school.id);
    }
  }, [school]);

  const handleExportAndShareEmail = async () => {
    if (!selectedSchoolId) {
      setToastMessage('Bitte wählen Sie eine Schule aus.');
      setShowToast(true);
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      setToastMessage('Teilen ist nur auf mobilen Geräten verfügbar.');
      setShowToast(true);
      return;
    }

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const username = userName ? `${userName}-` : '';
      const selectedSchool = schools?.find((s) => s.id === selectedSchoolId);
      const schoolName = selectedSchool?.name ? `${selectedSchool.name}-` : '';
      const filename = `netgrade-${schoolName}${username}${timestamp}.xlsx`;

      const result = await exportMutation.mutateAsync({
        options: {
          format: 'xlsx',
          filename,
          schoolId: selectedSchoolId,
        },
      });

      const reader = new FileReader();
      reader.readAsDataURL(result);

      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Clean = base64.split(',')[1];
          resolve(base64Clean);
        };
      });

      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      const fileUri = await Filesystem.getUri({
        path: filename,
        directory: Directory.Documents,
      });

      const filePath = fileUri.uri.startsWith('file://')
        ? fileUri.uri
        : `file://${fileUri.uri}`;

      await SocialSharing.shareViaEmail(
        'Im Anhang finden Sie den NetGrade-Datenexport.',
        filename,
        [],
        [],
        [],
        [filePath],
      );

      onClose();
    } catch (error) {
      console.error('Export/Share failed:', error);
      setToastMessage(
        error instanceof Error
          ? `Export fehlgeschlagen: ${error.message}`
          : 'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
      );
      setShowToast(true);
    }
  };

  return (
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
                Wählen Sie die Schule aus, deren Daten Sie exportieren und per
                E-Mail versenden möchten.
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
            onClick={handleExportAndShareEmail}
            disabled={exportMutation.isPending || !selectedSchoolId}
            className="ion-margin-top"
          >
            <IonIcon icon={downloadOutline} slot="start" />
            Exportieren & per E-Mail senden
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
    </IonModal>
  );
};
