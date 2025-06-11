import React, { useState } from 'react';
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
  useIonAlert,
  useIonToast,
  RefresherEventDetail,
} from '@ionic/react';
import { Routes } from '@/routes';

import SchoolsTab from '@/pages/home/settings/components/SchoolsTab';
import AdvancedTab from '@/pages/home/settings/components/AdvancedTab';
import UserTab from '@/pages/home/settings/components/UserTab';
import AddSchoolModal from '@/pages/home/settings/components/AddSchoolModal';
import { useSchools, useAddSchool } from '@/hooks/queries';
import { useResetAllDataMutation } from '@/hooks/queries/useDataManagementQueries';

const SettingsPage: React.FC = () => {
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [present] = useIonToast();

  const showToast = (message: string, isSuccess: boolean = true) => {
    present({
      message,
      duration: 2000,
      position: 'bottom',
      color: isSuccess ? 'success' : 'danger',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
  };

  const { data: schools = [], refetch } = useSchools();
  const addSchoolMutation = useAddSchool();
  const resetAllDataMutation = useResetAllDataMutation();

  const [presentAlert] = useIonAlert();

  const handleAddSchool = (schoolData: { name: string }) => {
    addSchoolMutation.mutate(
      {
        name: schoolData.name.trim(),
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

  const handleResetData = () => {
    const performReset = async () => {
      try {
        await resetAllDataMutation.mutateAsync();
        showToast('Alle Daten wurden erfolgreich zurückgesetzt');

        setTimeout(() => {
          window.location.replace(Routes.ONBOARDING);
        }, 1500);
      } catch (error) {
        console.error('Error resetting data:', error);
        showToast(
          'Beim Zurücksetzen der Daten ist ein Fehler aufgetreten',
          false,
        );
      }
    };

    presentAlert({
      header: 'Daten zurücksetzen',
      message:
        'Möchten Sie wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        { text: 'Zurücksetzen', role: 'destructive', handler: performReset },
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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={Routes.HOME} text="" />
          </IonButtons>
          <IonTitle>Einstellungen</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <UserTab />
        <SchoolsTab
          schools={schools}
          onAddSchool={() => setShowAddSchoolModal(true)}
        />

        <AdvancedTab onReset={handleResetData} />
      </IonContent>

      <AddSchoolModal
        isOpen={showAddSchoolModal}
        onDismiss={() => setShowAddSchoolModal(false)}
        onSubmit={handleAddSchool}
      />
    </IonPage>
  );
};

export default SettingsPage;
