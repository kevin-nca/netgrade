import React, { useState } from 'react';
import {
  IonIcon,
  IonLabel,
  IonToggle,
  IonPopover,
  IonBadge,
  IonContent,
  IonItem,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import {
  notificationsOutline,
  timeOutline,
  calendarOutline,
  statsChartOutline,
  refreshOutline,
  settingsOutline,
  playOutline,
  pauseOutline,
  alertCircleOutline,
  shieldCheckmarkOutline,
  pulseOutline,
} from 'ionicons/icons';
import {
  useNotificationSettings,
  useSaveNotificationSettings,
  useSchedulerStatus,
  useAvailableReminderTimes,
  useNotificationPermissions,
  useManualNotificationSync,
  useResetNotifications,
} from '@/hooks/queries/usePreferencesQueries';

const NotificationSettings: React.FC = () => {
  const [showTimePopover, setShowTimePopover] = useState(false);
  const [showDaysPopover, setShowDaysPopover] = useState(false);

  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();
  const { data: notificationSettings, isLoading: settingsLoading } =
    useNotificationSettings();
  const { data: schedulerStatus } = useSchedulerStatus();
  const { data: availableReminderTimes = [] } = useAvailableReminderTimes();
  const { refetch: checkPermissions } = useNotificationPermissions();

  const saveNotificationSettings = useSaveNotificationSettings();
  const manualSyncMutation = useManualNotificationSync();
  const resetNotificationsMutation = useResetNotifications();
  if (settingsLoading || !notificationSettings) {
    return <div>Loading...</div>;
  }

  const currentSettings = notificationSettings;
  const {
    isRunning = false,
    upcomingExams = 0,
    scheduledNotifications = 0,
  } = schedulerStatus || {};

  const showToast = (message: string, isSuccess: boolean = true) => {
    present({
      message,
      duration: 2000,
      position: 'bottom',
      color: isSuccess ? 'success' : 'danger',
    });
  };

  const formatTime = (time: [number, number]): string => {
    const [hours, minutes] = time;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const { data: hasPermission } = await checkPermissions();
      if (!hasPermission) {
        showToast(
          'Benachrichtigungen müssen in den Systemeinstellungen aktiviert werden',
          false,
        );
        return;
      }
    }

    const newSettings = { ...currentSettings, enabled };
    saveNotificationSettings.mutate(newSettings, {
      onSuccess: () => {
        showToast(
          enabled
            ? 'Benachrichtigungen aktiviert!'
            : 'Benachrichtigungen deaktiviert',
        );
      },
      onError: (error) => {
        console.error('Error toggling notifications:', error);
        showToast('Fehler beim Umschalten', false);
      },
    });
  };

  const handleUpdateSettings = async (updates: {
    reminderDays?: number;
    reminderTime?: [number, number];
  }) => {
    const newSettings = { ...currentSettings, ...updates };
    saveNotificationSettings.mutate(newSettings, {
      onSuccess: () => {
        showToast('Einstellungen gespeichert!');
      },
      onError: (error) => {
        console.error('Error updating settings:', error);
        showToast('Fehler beim Speichern', false);
      },
    });
  };

  const handleToggleScheduler = async (enabled: boolean) => {
    const newSettings = { ...currentSettings, autoSchedulingEnabled: enabled };
    saveNotificationSettings.mutate(newSettings, {
      onSuccess: () => {
        showToast(
          enabled
            ? 'Automatische Planung aktiviert!'
            : 'Automatische Planung deaktiviert',
        );
      },
      onError: (error) => {
        console.error('Error toggling auto scheduling:', error);
        showToast('Fehler beim Umschalten', false);
      },
    });
  };

  const handleManualSync = () => {
    showToast('Synchronisation läuft...');
    manualSyncMutation.mutate(undefined, {
      onSuccess: () => {
        showToast('Synchronisation abgeschlossen!');
      },
      onError: (error) => {
        console.error('Error in manual sync:', error);
        showToast('Fehler bei der Synchronisation', false);
      },
    });
  };

  const handleResetNotifications = () => {
    presentAlert({
      header: 'Benachrichtigungen reparieren',
      message:
        'Alle Benachrichtigungseinstellungen werden zurückgesetzt und neu geplant. Fortfahren?',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Reparieren',
          handler: () => {
            showToast('Repariere Benachrichtigungen...');
            resetNotificationsMutation.mutate(undefined, {
              onSuccess: () => {
                showToast('Benachrichtigungen wurden repariert!');
              },
              onError: (error) => {
                console.error('Error resetting notifications:', error);
                showToast('Fehler beim Reparieren', false);
              },
            });
          },
        },
      ],
    });
  };

  const getSchedulerStatusColor = () => {
    if (!currentSettings.enabled) return 'medium';
    return isRunning && currentSettings.autoSchedulingEnabled
      ? 'success'
      : 'warning';
  };

  const getSchedulerStatusText = () => {
    if (!currentSettings.enabled) return 'Benachrichtigungen deaktiviert';
    if (!currentSettings.autoSchedulingEnabled) return 'Manuelle Planung';
    return isRunning ? 'Läuft automatisch' : 'Gestoppt';
  };

  const hasNotificationIssues = () => {
    return (
      currentSettings.enabled &&
      currentSettings.autoSchedulingEnabled &&
      !isRunning
    );
  };

  const getNotificationStatusText = () => {
    if (hasNotificationIssues()) {
      return 'Scheduler nicht aktiv';
    }
    return 'Alles funktioniert';
  };

  return (
    <div className="settings-section notification-section">
      <div className="section-header">
        <h2 className="section-title">Benachrichtigungen</h2>
      </div>

      <div className="settings-list">
        <div className="notification-item glass-card primary">
          <div className="item-content">
            <div className="item-icon notification-primary">
              <IonIcon icon={notificationsOutline} />
            </div>
            <div className="item-text">
              <h3 className="item-title">Prüfungserinnerungen</h3>
              <p className="item-subtitle">
                Erhalte Erinnerungen für anstehende Prüfungen
              </p>
            </div>
            <div className="item-actions">
              <IonToggle
                className="item-toggle"
                checked={currentSettings.enabled}
                onIonChange={(e) => handleToggleNotifications(e.detail.checked)}
                disabled={saveNotificationSettings.isPending}
              />
            </div>
          </div>
        </div>

        {currentSettings.enabled && (
          <>
            <div
              className="notification-item glass-card secondary"
              onClick={() => setShowDaysPopover(true)}
            >
              <div className="item-content">
                <div className="item-icon notification-secondary">
                  <IonIcon icon={calendarOutline} />
                </div>
                <div className="item-text">
                  <h3 className="item-title">Tage im Voraus</h3>
                  <p className="item-subtitle">
                    {currentSettings.reminderDays === 1
                      ? '1 Tag vorher'
                      : currentSettings.reminderDays === 7
                        ? '1 Woche vorher'
                        : `${currentSettings.reminderDays} Tage vorher`}
                  </p>
                </div>
                <div className="item-actions">
                  <IonIcon className="item-chevron" icon={settingsOutline} />
                </div>
              </div>
            </div>
            <div
              className="notification-item glass-card secondary"
              onClick={() => setShowTimePopover(true)}
            >
              <div className="item-content">
                <div className="item-icon notification-secondary">
                  <IonIcon icon={timeOutline} />
                </div>
                <div className="item-text">
                  <h3 className="item-title">Uhrzeit</h3>
                  <p className="item-subtitle">
                    {formatTime(currentSettings.reminderTime)} Uhr
                  </p>
                </div>
                <div className="item-actions">
                  <IonIcon className="item-chevron" icon={settingsOutline} />
                </div>
              </div>
            </div>
            <div className="notification-item glass-card success">
              <div className="item-content">
                <div className="item-icon notification-success">
                  <IonIcon
                    icon={
                      isRunning && currentSettings.autoSchedulingEnabled
                        ? playOutline
                        : pauseOutline
                    }
                  />
                </div>
                <div className="item-text">
                  <h3 className="item-title">Automatischer Planer</h3>
                  <p className="item-subtitle">
                    <div className="status-display">
                      <div
                        className={`status-indicator ${isRunning && currentSettings.autoSchedulingEnabled ? 'active pulse' : 'inactive'}`}
                      />
                      <span className="status-text">
                        {getSchedulerStatusText()}
                      </span>
                    </div>
                  </p>
                </div>
                <div className="item-actions">
                  <IonToggle
                    className="item-toggle"
                    checked={currentSettings.autoSchedulingEnabled}
                    onIonChange={(e) => handleToggleScheduler(e.detail.checked)}
                    disabled={
                      !currentSettings.enabled ||
                      saveNotificationSettings.isPending
                    }
                  />
                </div>
              </div>
            </div>
            <div className="notification-item glass-card">
              <div className="item-content">
                <div className="item-icon notification-info">
                  <IonIcon icon={statsChartOutline} />
                </div>
                <div className="item-text">
                  <h3 className="item-title">Statistiken</h3>
                  <p className="item-subtitle">
                    {upcomingExams} anstehende Prüfungen •{' '}
                    {scheduledNotifications} geplante Benachrichtigungen
                  </p>
                </div>
                <div className="item-actions">
                  <IonBadge
                    className={`item-badge ${isRunning && currentSettings.autoSchedulingEnabled ? 'active' : 'inactive'}`}
                    color={getSchedulerStatusColor()}
                  >
                    {isRunning && currentSettings.autoSchedulingEnabled
                      ? 'Aktiv'
                      : 'Inaktiv'}
                  </IonBadge>
                </div>
              </div>
            </div>
            {hasNotificationIssues() && (
              <div
                className="notification-item glass-card warning"
                onClick={handleResetNotifications}
              >
                <div className="item-content">
                  <div className="item-icon notification-warning">
                    <IonIcon icon={alertCircleOutline} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">Problem erkannt</h3>
                    <p className="item-subtitle">
                      {getNotificationStatusText()} - Tippen zum Reparieren
                    </p>
                  </div>
                  <div className="item-actions">
                    <IonIcon
                      className="item-chevron"
                      icon={shieldCheckmarkOutline}
                    />
                  </div>
                </div>
              </div>
            )}
            <div
              className="notification-item glass-card"
              onClick={handleManualSync}
            >
              <div className="item-content">
                <div className="item-icon notification-gray">
                  <IonIcon icon={refreshOutline} />
                </div>
                <div className="item-text">
                  <h3 className="item-title">Jetzt synchronisieren</h3>
                  <p className="item-subtitle">
                    Sofort nach neuen Benachrichtigungen suchen
                  </p>
                </div>
                <div className="item-actions">
                  <IonIcon className="item-chevron" icon={pulseOutline} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <IonPopover
        isOpen={showTimePopover}
        onDidDismiss={() => setShowTimePopover(false)}
        showBackdrop={true}
      >
        <IonContent>
          {availableReminderTimes.map((time, index) => (
            <IonItem
              key={index}
              button
              onClick={async () => {
                await handleUpdateSettings({ reminderTime: time });
                setShowTimePopover(false);
              }}
            >
              <IonLabel>{formatTime(time)} Uhr</IonLabel>
            </IonItem>
          ))}
        </IonContent>
      </IonPopover>
      <IonPopover
        isOpen={showDaysPopover}
        onDidDismiss={() => setShowDaysPopover(false)}
        showBackdrop={true}
      >
        <IonContent>
          <IonItem
            button
            onClick={async () => {
              await handleUpdateSettings({ reminderDays: 1 });
              setShowDaysPopover(false);
            }}
          >
            <IonLabel>1 Tag vorher</IonLabel>
          </IonItem>
          <IonItem
            button
            onClick={async () => {
              await handleUpdateSettings({ reminderDays: 2 });
              setShowDaysPopover(false);
            }}
          >
            <IonLabel>2 Tage vorher</IonLabel>
          </IonItem>
          <IonItem
            button
            onClick={async () => {
              await handleUpdateSettings({ reminderDays: 3 });
              setShowDaysPopover(false);
            }}
          >
            <IonLabel>3 Tage vorher</IonLabel>
          </IonItem>
          <IonItem
            button
            onClick={async () => {
              await handleUpdateSettings({ reminderDays: 7 });
              setShowDaysPopover(false);
            }}
          >
            <IonLabel>1 Woche vorher</IonLabel>
          </IonItem>
        </IonContent>
      </IonPopover>
    </div>
  );
};

export default NotificationSettings;
