import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonInput,
  IonModal,
  IonItem,
  useIonAlert,
  useIonToast,
  RefresherEventDetail,
} from '@ionic/react';
import {
  personOutline,
  schoolOutline,
  addOutline,
  downloadOutline,
  trashOutline,
  settingsOutline,
  informationCircleOutline,
  createOutline,
} from 'ionicons/icons';
import { Routes } from '@/routes';
import { ExportDialog } from '@/components/export/ExportDialog';
import {
  useSchools,
  useAddSchool,
  useUserName,
  useSaveUserName,
} from '@/hooks/queries';
import { useResetAllDataMutation } from '@/hooks/queries/useDataManagementQueries';
import AddSchoolModal from '@/components/modals/AddSchoolModal';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [schoolNameInput, setSchoolNameInput] = useState('');
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [appVersion] = useState('');
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();

  const { data: schools = [], refetch } = useSchools();
  const { data: userName } = useUserName();
  const addSchoolMutation = useAddSchool();
  const saveUserNameMutation = useSaveUserName();
  const resetAllDataMutation = useResetAllDataMutation();

  useEffect(() => {
    if (userName) {
      setNameInput(userName);
    }
  }, [userName]);

  const showToast = (message: string, isSuccess: boolean = true) => {
    present({
      message,
      duration: 2000,
      position: 'bottom',
      color: isSuccess ? 'success' : 'danger',
    });
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      saveUserNameMutation.mutate(nameInput.trim(), {
        onSuccess: () => {
          setShowNameEditModal(false);
          showToast('Name erfolgreich gespeichert');
        },
        onError: (error) => {
          showToast(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            false,
          );
        },
      });
    }
  };

  const handleCancelNameEdit = () => {
    setNameInput(userName || '');
    setShowNameEditModal(false);
  };

  const handleAddSchool = () => {
    if (schoolNameInput.trim()) {
      addSchoolMutation.mutate(
        { name: schoolNameInput.trim() },
        {
          onSuccess: () => {
            setShowAddSchoolModal(false);
            setSchoolNameInput('');
            showToast('Schule erfolgreich hinzugefügt');
            refetch();
          },
          onError: (error) => {
            showToast(
              `Fehler: ${error instanceof Error ? error.message : String(error)}`,
              false,
            );
          },
        },
      );
    }
  };

  const handleResetData = () => {
    presentAlert({
      header: 'Daten zurücksetzen',
      message:
        'Möchten Sie wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Zurücksetzen',
          role: 'destructive',
          handler: async () => {
            try {
              await resetAllDataMutation.mutateAsync();
              showToast('Alle Daten wurden erfolgreich zurückgesetzt');
              setTimeout(() => {
                window.location.replace(Routes.ONBOARDING);
              }, 1500);
            } catch (error) {
              showToast(
                'Beim Zurücksetzen der Daten ist ein Fehler aufgetreten',
                false,
              );
            }
          },
        },
      ],
    });
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await refetch();
    } finally {
      event.detail.complete();
    }
  };

  return (
    <IonPage className="settings-page">
      <IonHeader className="settings-header">
        <IonToolbar className="settings-toolbar">
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={Routes.HOME}
              text=""
              className="back-button"
            />
          </IonButtons>
          <IonTitle className="settings-title">Einstellungen</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="settings-content" scrollY={true}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="content-wrapper">
          <div className="profile-section">
            <div className="gradient-orb" />
            <div className="profile-card glass-card">
              <div className="shimmer-effect" />
              <div className="profile-content">
                <div className="profile-avatar">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                  <h1 className="profile-name">{userName || 'Benutzer'}</h1>
                  <p className="profile-subtitle">
                    Verwalte deine App-Einstellungen
                  </p>
                </div>
                <div
                  className="profile-edit-button"
                  onClick={() => setShowNameEditModal(true)}
                >
                  <IonIcon
                    icon={settingsOutline}
                    className="profile-edit-icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Deine Schulen</h2>
              <div
                className="section-add-button"
                onClick={() => setShowAddSchoolModal(true)}
              >
                <IonIcon icon={addOutline} className="section-add-icon" />
              </div>
            </div>

            <div className="settings-list">
              {schools.length > 0 ? (
                schools.map((school, index) => (
                  <div key={school.id} className="settings-item glass-card">
                    <div className="item-content">
                      <div className={`item-icon school-${index % 4}`}>
                        {school.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="item-text">
                        <h3 className="item-title">{school.name}</h3>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="settings-item glass-card empty-item">
                  <div className="item-content">
                    <div className="item-icon empty">
                      <IonIcon icon={schoolOutline} />
                    </div>
                    <div className="item-text">
                      <h3 className="item-title">Keine Schulen</h3>
                      <p className="item-subtitle">
                        Tippe auf + um eine Schule hinzuzufügen
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Aktionen</h2>
            </div>

            <div className="settings-list">
              <div
                className="settings-item glass-card"
                onClick={() => setIsExportDialogOpen(true)}
              >
                <div className="item-content">
                  <div className="item-icon export">
                    <IonIcon icon={downloadOutline} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">Daten exportieren</h3>
                    <p className="item-subtitle">
                      Als Excel-Datei herunterladen
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="settings-item glass-card"
                onClick={handleResetData}
              >
                <div className="item-content">
                  <div className="item-icon danger">
                    <IonIcon icon={trashOutline} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">Alle Daten löschen</h3>
                    <p className="item-subtitle">App komplett zurücksetzen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card glass-card">
            <IonIcon icon={informationCircleOutline} className="info-icon" />
            <div className="info-text">
              <h4 className="info-title">Wichtiger Hinweis</h4>
              <p className="info-description">
                Exportiere deine Daten regelmässig als Backup. Das Zurücksetzen
                kann nicht rückgängig gemacht werden.
              </p>
            </div>
          </div>

          {appVersion && (
            <div className="app-version">
              <p className="version-text">{appVersion}</p>
            </div>
          )}

          <div style={{ height: '80px' }} />
        </div>
      </IonContent>

      <AddSchoolModal
        isOpen={showAddSchoolModal}
        onClose={() => {
          setShowAddSchoolModal(false);
          setSchoolNameInput('');
        }}
        schoolName={schoolNameInput}
        setSchoolName={setSchoolNameInput}
        onAdd={handleAddSchool}
        isLoading={addSchoolMutation.isPending}
      />

      <IonModal
        isOpen={showNameEditModal}
        onDidDismiss={handleCancelNameEdit}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
        initialBreakpoint={0.75}
        backdropBreakpoint={0.5}
        className="settings-modal"
      >
        <IonPage className="modal-page">
          <IonHeader className="modal-header">
            <IonToolbar className="modal-toolbar">
              <IonTitle className="modal-title">Namen bearbeiten</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent className="modal-content" scrollY={true}>
            <div className="modal-content-wrapper">
              <div className="modal-header-section">
                <div className="modal-gradient-orb" />
                <div className="modal-header-content">
                  <div className="modal-header-flex">
                    <div className="modal-icon-wrapper">
                      <IonIcon icon={personOutline} className="modal-icon" />
                    </div>
                    <div className="modal-text">
                      <h1>Dein Name</h1>
                      <p>Wie möchtest du genannt werden?</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-input-section">
                <h2 className="modal-section-title">Name eingeben</h2>

                <div className="modal-input-wrapper glass-input">
                  <IonItem lines="none" className="modal-input-item">
                    <div slot="start" className="modal-input-icon-wrapper">
                      <IonIcon
                        icon={createOutline}
                        className="modal-input-icon"
                      />
                    </div>
                    <IonInput
                      value={nameInput}
                      placeholder="Dein Name..."
                      onIonChange={(e) => setNameInput(e.detail.value || '')}
                      className="modal-input-field"
                      clearInput
                      autoFocus
                    />
                  </IonItem>
                </div>
              </div>

              <div className="modal-button-section">
                <div className="modal-buttons">
                  <button
                    onClick={handleCancelNameEdit}
                    className="modal-button cancel"
                    disabled={saveUserNameMutation.isPending}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveName}
                    disabled={
                      saveUserNameMutation.isPending ||
                      !nameInput.trim() ||
                      nameInput.trim() === (userName || '')
                    }
                    className="modal-button save"
                  >
                    {saveUserNameMutation.isPending
                      ? 'Speichert...'
                      : 'Speichern'}
                  </button>
                </div>
              </div>

              <div className="modal-bottom-spacer" />
            </div>
          </IonContent>
        </IonPage>
      </IonModal>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </IonPage>
  );
};

export default SettingsPage;
