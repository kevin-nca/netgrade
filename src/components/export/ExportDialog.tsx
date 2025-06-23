import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonButton,
  IonButtons,
  IonIcon,
  IonToast,
  IonLoading,
  IonModal,
  IonRippleEffect,
  IonPage,
  IonInput,
} from '@ionic/react';
import {
  close,
  shareOutline,
  downloadOutline,
  sparklesSharp,
  documentTextOutline,
  calendarOutline,
  personOutline,
  pencilOutline,
} from 'ionicons/icons';
import { useExportData } from '@/hooks/queries/useDataManagementQueries';
import { useUserName } from '@/hooks';
import { useSchools } from '@/hooks/queries/useSchoolQueries';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { School } from '@/db/entities';
import './ExportDialog.css';

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
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [customFilename, setCustomFilename] = useState<string>('');
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
    const generateDefaultFilename = () => {
      const timestamp = new Date().toISOString().split('T')[0];
      const username = userName ? `${userName}-` : '';
      const selectedSchool = schools?.find((s) => s.id === selectedSchoolId);
      const schoolName = selectedSchool?.name ? `${selectedSchool.name}-` : '';
      return `netgrade-${schoolName}${username}${timestamp}`;
    };

    const newFilename = generateDefaultFilename();
    setCustomFilename(newFilename.replace('.xlsx', ''));
  }, [selectedSchoolId, userName, schools]);

  const showToast = (
    message: string,
    color: ToastState['color'] = 'danger',
  ) => {
    setToast({ show: true, message, color });
  };

  const getFinalFilename = () => {
    const cleanFilename = customFilename.trim();
    return cleanFilename.endsWith('.xlsx')
      ? cleanFilename
      : `${cleanFilename}.xlsx`;
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
        encoding: undefined,
      });
      await Filesystem.stat({
        path: properFilename,
        directory: Directory.Documents,
      });
      const fileUri = await Filesystem.getUri({
        path: properFilename,
        directory: Directory.Documents,
      });

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

    if (!customFilename.trim()) {
      showToast('Bitte geben Sie einen Dateinamen ein.');
      return;
    }

    try {
      const filename = getFinalFilename();

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

  const selectedSchool = schools?.find((s) => s.id === selectedSchoolId);

  const getSchoolIconClass = (schoolId: string, index: number) => {
    const baseClass = 'school-icon';
    if (selectedSchoolId === schoolId) {
      return `${baseClass} school-icon-selected`;
    }
    return `${baseClass} school-icon-${index % 4}`;
  };

  const isExportButtonEnabled = selectedSchoolId && customFilename.trim();

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
        initialBreakpoint={0.75}
        backdropBreakpoint={0.5}
        className="export-modal"
      >
        <IonPage className="export-page">
          <IonHeader className="liquid-glass-bg export-header">
            <IonToolbar className="export-toolbar">
              <IonButtons slot="start">
                <IonButton
                  onClick={onClose}
                  fill="clear"
                  className="header-close-button"
                >
                  <IonIcon
                    icon={close}
                    slot="icon-only"
                    className="header-close-icon"
                  />
                </IonButton>
              </IonButtons>

              <IonTitle className="header-title">Daten exportieren</IonTitle>

              <IonButtons slot="end">
                <IonButton fill="clear" className="header-dummy-button">
                  <IonIcon
                    icon={close}
                    slot="icon-only"
                    className="header-close-icon"
                  />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="export-content" scrollY={true}>
            <div className="content-wrapper">
              <div className="header-section">
                <div className="gradient-orb" />
                <div className="header-content">
                  <div className="header-flex">
                    <div className="header-icon-wrapper">
                      <IonIcon icon={sparklesSharp} className="header-icon" />
                    </div>
                    <div className="header-text">
                      <h1>Excel-Export</h1>
                      <p>Erstelle eine Datensicherung</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="school-section">
                <h2 className="section-title">Schule auswählen</h2>

                <IonRadioGroup
                  value={selectedSchoolId}
                  onIonChange={(e) => setSelectedSchoolId(e.detail.value)}
                >
                  {schools?.map((school, index) => (
                    <div
                      key={school.id}
                      className={`school-item-wrapper ${selectedSchoolId === school.id ? 'glass-card' : ''}`}
                    >
                      <IonItem
                        lines="none"
                        className="school-item ion-activatable"
                        onClick={() => setSelectedSchoolId(school.id)}
                      >
                        <IonRippleEffect />
                        <div
                          slot="start"
                          className={getSchoolIconClass(school.id, index)}
                        >
                          <span className="school-icon-letter">
                            {school.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <IonLabel className="school-label">
                          <h3>{school.name}</h3>
                        </IonLabel>
                        <IonRadio
                          slot="end"
                          value={school.id}
                          className="school-radio"
                        />
                      </IonItem>
                    </div>
                  ))}
                </IonRadioGroup>
              </div>

              {selectedSchoolId && (
                <div className="filename-section">
                  <h2 className="section-title">Dateiname</h2>

                  <div className="filename-input filename-input-wrapper">
                    <IonItem lines="none" className="filename-item">
                      <div slot="start" className="filename-icon-wrapper">
                        <IonIcon
                          icon={pencilOutline}
                          className="filename-icon"
                        />
                      </div>
                      <IonInput
                        value={customFilename}
                        placeholder="Dateiname eingeben..."
                        onIonInput={(e) => setCustomFilename(e.detail.value!)}
                        className="filename-input-field"
                      />
                      <div slot="end" className="filename-extension">
                        .xlsx
                      </div>
                    </IonItem>
                  </div>
                </div>
              )}

              <div className="export-button-section">
                <IonButton
                  expand="block"
                  onClick={handleExport}
                  disabled={exportMutation.isPending || !isExportButtonEnabled}
                  className={`export-button ${isExportButtonEnabled ? 'glass-button export-button-enabled' : 'export-button-disabled'}`}
                >
                  <IonIcon
                    icon={isNative ? shareOutline : downloadOutline}
                    slot="start"
                    className="export-button-icon"
                  />
                  {isNative ? 'Exportieren und teilen' : 'Jetzt herunterladen'}
                </IonButton>
              </div>

              {selectedSchool && customFilename.trim() && (
                <div className="glass-card details-card">
                  <div className="shimmer-effect shimmer-overlay" />

                  <h3 className="details-title">Export-Details</h3>

                  <div className="details-list">
                    <div className="detail-item">
                      <div className="detail-icon-wrapper detail-icon-wrapper-file">
                        <IonIcon
                          icon={documentTextOutline}
                          className="detail-icon detail-icon-file"
                        />
                      </div>
                      <div className="detail-content">
                        <p className="detail-label">Dateiformat</p>
                        <p className="detail-value">Excel (.xlsx)</p>
                      </div>
                    </div>

                    {userName && (
                      <div className="detail-item">
                        <div className="detail-icon-wrapper detail-icon-wrapper-user">
                          <IonIcon
                            icon={personOutline}
                            className="detail-icon detail-icon-user"
                          />
                        </div>
                        <div className="detail-content">
                          <p className="detail-label">Benutzer</p>
                          <p className="detail-value">{userName}</p>
                        </div>
                      </div>
                    )}

                    <div className="detail-item">
                      <div className="detail-icon-wrapper detail-icon-wrapper-date">
                        <IonIcon
                          icon={calendarOutline}
                          className="detail-icon detail-icon-date"
                        />
                      </div>
                      <div className="detail-content">
                        <p className="detail-label">Datum</p>
                        <p className="detail-value">
                          {new Date().toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-pill filename-pill">
                    <p className="filename-pill-label">Dateiname</p>
                    <p className="filename-pill-value">{getFinalFilename()}</p>
                  </div>
                </div>
              )}

              <div className="bottom-spacer" />
            </div>
          </IonContent>

          <IonLoading
            isOpen={exportMutation.isPending}
            message="Exportiere Daten... Einen Moment bitte"
            spinner="crescent"
            cssClass="loading-glass export-loading"
          />
        </IonPage>
      </IonModal>

      <IonToast
        isOpen={toast.show}
        onDidDismiss={() => setToast({ ...toast, show: false })}
        message={toast.message}
        duration={3000}
        position="bottom"
        color={toast.color}
        cssClass={`glass-toast glass-toast-${toast.color}`}
      />
    </>
  );
};
