import React, { useEffect, useState } from 'react';
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { useForm } from '@tanstack/react-form';
import { useHistory } from 'react-router-dom';
import {
  addOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  downloadOutline,
  informationCircleOutline,
  pencilOutline,
  personOutline,
  schoolOutline,
  settingsOutline,
  trashOutline,
} from 'ionicons/icons';
import { Routes } from '@/routes';
import { ExportDialog } from '@/components/export/ExportDialog';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import {
  useAddSchool,
  useDeleteSchool,
  useSaveUserName,
  useSchools,
  useUpdateSchool,
  useUserName,
} from '@/hooks/queries';
import { useResetAllDataMutation } from '@/hooks/queries/useDataManagementQueries';
import AddSchoolModal from '@/components/modals/AddSchoolModal';
import Header from '@/components/Header/Header';
import NotificationSettings from '@/pages/home/settings/notification/NotificationSettings';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [schoolNameInput, setSchoolNameInput] = useState('');
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [appVersion] = useState('');
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [schoolIdToDelete, setSchoolIdToDelete] = useState<string | null>(null);
  const history = useHistory();

  const { data: schools } = useSchools();
  const { data: userName } = useUserName();
  const addSchoolMutation = useAddSchool();
  const saveUserNameMutation = useSaveUserName();
  const resetAllDataMutation = useResetAllDataMutation();
  const deleteSchoolMutation = useDeleteSchool();
  const updateSchoolMutation = useUpdateSchool();

  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editSchoolName, setEditSchoolName] = useState('');

  const toggleSchool = (id: string) => {
    setExpandedSchoolId((prev) => (prev === id ? null : id));
  };

  const handleEditSchool = (
    schoolId: string,
    currentName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setEditingSchoolId(schoolId);
    setEditSchoolName(currentName);
  };

  const handleSaveSchoolEdit = (schoolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editSchoolName.trim()) {
      updateSchoolMutation.mutate(
        { id: schoolId, name: editSchoolName.trim() },
        {
          onSuccess: () => {
            setEditingSchoolId(null);
            setEditSchoolName('');
            showToast('Schulname erfolgreich geändert');
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

  const handleCancelSchoolEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSchoolId(null);
    setEditSchoolName('');
  };

  const nameForm = useForm({
    defaultValues: {
      nameInput: userName || '',
    },
    onSubmit: async ({ value }) => {
      saveUserNameMutation.mutate(value.nameInput.trim(), {
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
    },
  });

  useEffect(() => {
    if (userName) {
      nameForm.setFieldValue('nameInput', userName);
    }
  }, [userName, nameForm]);

  const showToast = (message: string, isSuccess: boolean = true) => {
    present({
      message,
      duration: 2000,
      position: 'bottom',
      color: isSuccess ? 'success' : 'danger',
    });
  };

  const handleSaveName = () => {
    nameForm.handleSubmit();
  };

  const handleCancelNameEdit = () => {
    nameForm.setFieldValue('nameInput', userName || '');
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
                history.replace(Routes.ONBOARDING);
              }, 1500);
            } catch {
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

  const handleDeleteSchool = () => {
    if (!schoolIdToDelete) return;
    deleteSchoolMutation.mutate(schoolIdToDelete, {
      onSuccess: () => {
        showToast('Schule wurde gelöscht', true);
        setShowDeleteAlert(false);
        setSchoolIdToDelete(null);
      },
      onError: (error) => {
        showToast(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          false,
        );
        setShowDeleteAlert(false);
        setSchoolIdToDelete(null);
      },
    });
  };

  return (
    <IonPage className="settings-page">
      <Header
        title="Einstellungen"
        backButton={true}
        defaultHref={Routes.HOME}
      />

      <IonContent className="settings-content" scrollY={true}>
        <div className="content-wrapper">
          <div className="profile-section">
            <div className="gradient-orb" />
            <div className="profile-card glass-card">
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
              {schools!.length > 0 ? (
                schools!.map((school, index) => {
                  const isExpanded = expandedSchoolId === school.id;
                  const isEditing = editingSchoolId === school.id;

                  return (
                    <div
                      key={school.id}
                      className={`settings-item glass-card ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleSchool(school.id)}
                    >
                      <div className="item-content">
                        <div className={`item-icon school-${index % 4}`}>
                          {school.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="item-text">
                          {isEditing ? (
                            <div className="edit-school-input">
                              <IonInput
                                value={editSchoolName}
                                placeholder="Schulname..."
                                onIonChange={(e) =>
                                  setEditSchoolName(e.detail.value || '')
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="school-edit-field"
                                clearInput
                                autoFocus
                              />
                            </div>
                          ) : (
                            <h3 className="item-title">{school.name}</h3>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div
                          className="item-extra"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IonButtons slot="end">
                            {isEditing ? (
                              <div className="edit-buttons">
                                <IonButton
                                  className="save-button"
                                  color="success"
                                  onClick={(e) =>
                                    handleSaveSchoolEdit(school.id, e)
                                  }
                                  disabled={
                                    updateSchoolMutation.isPending ||
                                    !editSchoolName.trim() ||
                                    editSchoolName.trim() === school.name
                                  }
                                >
                                  <IonIcon
                                    slot="icon-only"
                                    icon={checkmarkOutline}
                                  />
                                  <p className="save-text">Speichern</p>
                                </IonButton>
                                <IonButton
                                  className="cancel-button"
                                  color="medium"
                                  onClick={handleCancelSchoolEdit}
                                  disabled={updateSchoolMutation.isPending}
                                >
                                  <IonIcon
                                    slot="icon-only"
                                    icon={closeOutline}
                                  />
                                  <p className="cancel-text">Abbrechen</p>
                                </IonButton>
                              </div>
                            ) : (
                              <>
                                <IonButton
                                  className="edit-button"
                                  color="primary"
                                  onClick={(e) =>
                                    handleEditSchool(school.id, school.name, e)
                                  }
                                >
                                  <IonIcon
                                    slot="icon-only"
                                    icon={pencilOutline}
                                  />
                                  <p className="edit-text">Bearbeiten</p>
                                </IonButton>
                                <IonButton
                                  className="delete-button"
                                  color="danger"
                                  onClick={() => {
                                    setSchoolIdToDelete(school.id);
                                    setShowDeleteAlert(true);
                                  }}
                                >
                                  <IonIcon
                                    slot="icon-only"
                                    icon={trashOutline}
                                  />
                                  <p className="delete-text">Löschen</p>
                                </IonButton>
                              </>
                            )}
                          </IonButtons>
                        </div>
                      )}
                    </div>
                  );
                })
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
          <NotificationSettings />
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

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />
      </IonContent>

      <AddSchoolModal
        isOpen={showAddSchoolModal}
        onClose={() => setShowAddSchoolModal(false)}
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
                    <nameForm.Field name="nameInput">
                      {(field) => (
                        <IonInput
                          value={field.state.value}
                          placeholder="Dein Name..."
                          onIonChange={(e) =>
                            field.handleChange(e.detail.value || '')
                          }
                          className="modal-input-field"
                          clearInput
                          autoFocus
                        />
                      )}
                    </nameForm.Field>
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
                  <nameForm.Subscribe
                    selector={(state) => [state.values.nameInput]}
                  >
                    {([nameInput]) => (
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
                    )}
                  </nameForm.Subscribe>
                </div>
              </div>

              <div className="modal-bottom-spacer" />
            </div>
          </IonContent>
        </IonPage>
      </IonModal>
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => {
          setShowDeleteAlert(false);
          setSchoolIdToDelete(null);
        }}
        header="Schule löschen?"
        message={`Möchtest du die Schule wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        buttons={[
          {
            text: 'Abbrechen',
            role: 'cancel',
            handler: () => {
              setShowDeleteAlert(false);
              setSchoolIdToDelete(null);
            },
          },
          {
            text: 'Löschen',
            role: 'destructive',
            handler: handleDeleteSchool,
          },
        ]}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </IonPage>
  );
};

export default SettingsPage;
