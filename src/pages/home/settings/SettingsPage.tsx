import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  useIonAlert,
  useIonRouter,
  RefresherEventDetail,
} from '@ionic/react';
import { Routes } from '@/routes';

import ProfileTab from '@/components/Settings/ProfileTab';
import SchoolsTab from '@/components/Settings/SchoolsTab';
import AdvancedTab from '@/components/Settings/AdvancedTab';
import AddSchoolModal from '@/components/Settings/AddSchoolModal';
import IOSToast from '@/components/UI/IOSToast';
import { useSettings } from '@/hooks/useSettings';
import { useSchools, useAddSchool, useDeleteSchool } from '@/hooks/queries';
import { useResetAllDataMutation } from '@/hooks/queries/useDataManagementQueries';

type SettingsTab = 'profile' | 'schools' | 'advanced';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);

  const {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    toastState,
    showToast,
  } = useSettings();
  const {
    data: schools = [],
    error: schoolsError,
    isLoading,
    refetch,
  } = useSchools();
  const addSchoolMutation = useAddSchool();
  const deleteSchoolMutation = useDeleteSchool();
  const resetAllDataMutation = useResetAllDataMutation();

  const [presentAlert] = useIonAlert();
  const router = useIonRouter();

  const handleAddSchool = (schoolData: {
    name: string;
    type: string;
    address: string;
  }) => {
    addSchoolMutation.mutate(
      {
        name: schoolData.name.trim(),
        type: schoolData.type?.trim() || undefined,
        address: schoolData.address?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowAddSchoolModal(false);
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
  };

  const handleDeleteSchool = (schoolId: string) => {
    presentAlert({
      header: 'Schule löschen',
      message: 'Möchten Sie diese Schule wirklich löschen?',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => {
            deleteSchoolMutation.mutate(schoolId, {
              onSuccess: () => {
                showToast('Schule erfolgreich gelöscht');
                refetch();
              },
              onError: (error) => {
                showToast(
                  `Fehler: ${error instanceof Error ? error.message : String(error)}`,
                  false,
                );
              },
            });
          },
        },
      ],
    });
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
              resetSettings();
              showToast('Alle Daten wurden erfolgreich zurückgesetzt');

              setTimeout(() => {
                router.push(Routes.HOME, 'root');
              }, 1500);
            } catch (error) {
              console.error('Error resetting data:', error);
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
    <IonPage className="ios-settings-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={Routes.HOME} text="" />
          </IonButtons>
          <IonTitle>Einstellungen</IonTitle>
        </IonToolbar>
        <IonToolbar className="segment-toolbar">
          <div className="segment-container">
            <IonSegment
              value={activeTab}
              onIonChange={(e) => setActiveTab(e.detail.value as SettingsTab)}
              mode="ios"
              className="custom-segment"
            >
              <IonSegmentButton value="profile" mode="ios">
                <IonLabel>Profil</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="schools" mode="ios">
                <IonLabel>Schulen</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="advanced" mode="ios">
                <IonLabel>Erweitert</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="settings-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {activeTab === 'profile' && (
          <ProfileTab settings={settings} onUpdate={updateSettings} />
        )}

        {activeTab === 'schools' && (
          <SchoolsTab
            schools={schools}
            isLoading={isLoading}
            error={schoolsError}
            onAddSchool={() => setShowAddSchoolModal(true)}
            onDeleteSchool={handleDeleteSchool}
          />
        )}

        {activeTab === 'advanced' && (
          <AdvancedTab onSave={saveSettings} onReset={handleResetData} />
        )}
      </IonContent>

      {activeTab === 'profile' && (
        <IonFooter className="ios-footer">
          <IonToolbar>
            <IonButton
              expand="block"
              onClick={saveSettings}
              className="ios-button save-button"
            >
              Einstellungen speichern
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}

      <AddSchoolModal
        isOpen={showAddSchoolModal}
        onDismiss={() => setShowAddSchoolModal(false)}
        onSubmit={handleAddSchool}
      />

      <IOSToast
        message={toastState.message}
        isVisible={toastState.show}
        onDismiss={() => showToast('', true)}
        type={toastState.type}
      />
    </IonPage>
  );
};

export default SettingsPage;
