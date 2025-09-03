import {
  PreferencesService,
  NotificationSettings,
  ExamService,
} from './services';
import {
  LocalNotifications,
  LocalNotificationSchema,
} from '@capacitor/local-notifications';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App, AppState } from '@capacitor/app';
import { Exam } from './db/entities';

interface RequiredNotification {
  id: number;
  examId: string;
  examName: string;
  examDate: Date;
  reminderDate: Date;
  reminderDays: number;
}

class NotificationScheduler {
  private static instance: NotificationScheduler;
  private intervalId: number | null = null;
  private isRunning = false;
  private readonly CHECK_INTERVAL = 60000;
  private appStateListener: PluginListenerHandle | null = null;
  private lastCheckTime = 0;
  private readonly MIN_CHECK_INTERVAL = 30000;

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    console.log('Starting notification scheduler...');
    this.isRunning = true;
    await this.performSchedulingCheck();
    if (Capacitor.isNativePlatform()) {
      await this.setupAppLifecycleListeners();
    }
    this.startPeriodicChecking();
    console.log(
      'Notification scheduler started - will check settings automatically',
    );
  }

  stop(): void {
    console.log('Stopping notification scheduler...');

    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }

    this.isRunning = false;
    console.log('Notification scheduler stopped');
  }

  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  private async setupAppLifecycleListeners(): Promise<void> {
    this.appStateListener = await App.addListener(
      'appStateChange',
      async (state: AppState) => {
        console.log(
          'App state changed to:',
          state.isActive ? 'active' : 'background',
        );
        if (state.isActive) {
          console.log(
            'App became active - performing immediate notification check',
          );
          await this.performSchedulingCheck();
        }
      },
    );
  }

  /**
   * Fallback periodic checking for web platform or as backup
   */
  private startPeriodicChecking(): void {
    this.intervalId = window.setInterval(async () => {
      try {
        await this.performSchedulingCheck();
      } catch (error) {
        console.error('Error in periodic notification scheduling:', error);
      }
    }, this.CHECK_INTERVAL);
  }

  /**
   * Main scheduling logic with rate limiting and internal settings check
   * The scheduler always checks settings internally rather than being controlled externally
   */
  private async performSchedulingCheck(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCheckTime < this.MIN_CHECK_INTERVAL) {
      console.log('Skipping notification check due to rate limiting');
      return;
    }

    this.lastCheckTime = now;

    try {
      const settings = await PreferencesService.getNotificationSettings();

      if (!settings.enabled || !Capacitor.isNativePlatform()) {
        console.log(
          'Notifications disabled or not on native platform - clearing any existing notifications',
        );
        await this.clearAllScheduledNotifications();
        return;
      }

      console.log('Performing notification scheduling check...');
      await this.checkAndScheduleNotifications();
    } catch (error) {
      console.error('Error in notification scheduling check:', error);
    }
  }

  /**
   * Clear all scheduled exam notifications
   */
  private async clearAllScheduledNotifications(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) return;

      const pendingResult = await LocalNotifications.getPending();
      const examNotifications =
        pendingResult.notifications?.filter(
          (n) => n.extra?.type === 'exam_reminder',
        ) || [];

      if (examNotifications.length > 0) {
        const idsToCancel = examNotifications.map((n) => ({ id: n.id }));
        await LocalNotifications.cancel({ notifications: idsToCancel });
        console.log(
          `Cleared ${idsToCancel.length} scheduled exam notifications`,
        );
      }
    } catch (error) {
      console.error('Error clearing scheduled notifications:', error);
    }
  }

  private async checkAndScheduleNotifications(): Promise<void> {
    const settings = await PreferencesService.getNotificationSettings();

    if (!settings.enabled || !Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const upcomingExams = await this.getUpcomingExams();
      const requiredNotifications = this.computeRequiredNotifications(
        upcomingExams,
        settings,
      );
      const pendingResult = await LocalNotifications.getPending();
      const currentNotifications = pendingResult.notifications || [];

      await this.cancelOutdatedNotifications(
        currentNotifications,
        requiredNotifications,
      );
      await this.scheduleMissingNotifications(
        currentNotifications,
        requiredNotifications,
      );
    } catch (error) {
      console.error('Error processing exam notifications:', error);
    }
  }

  private async getUpcomingExams(): Promise<Exam[]> {
    const allExams = await ExamService.fetchAll();
    const now = new Date();
    return allExams.filter(
      (exam) => !exam.isCompleted && new Date(exam.date) > now,
    );
  }

  private computeRequiredNotifications(
    exams: Exam[],
    settings: NotificationSettings,
  ): RequiredNotification[] {
    const requiredNotifications: RequiredNotification[] = [];
    const now = new Date();

    for (const exam of exams) {
      const examDate = new Date(exam.date);
      const reminderDate = new Date(examDate);
      reminderDate.setDate(reminderDate.getDate() - settings.reminderDays);
      const [hours, minutes] = settings.reminderTime;
      reminderDate.setHours(hours, minutes, 0, 0);

      if (reminderDate > now) {
        const notificationId = this.generateNotificationId(exam.id, examDate);

        requiredNotifications.push({
          id: notificationId,
          examId: exam.id,
          examName: exam.name,
          examDate,
          reminderDate,
          reminderDays: settings.reminderDays,
        });
      }
    }

    return requiredNotifications;
  }

  private async cancelOutdatedNotifications(
    currentNotifications: LocalNotificationSchema[],
    requiredNotifications: RequiredNotification[],
  ): Promise<void> {
    const requiredIds = new Set(requiredNotifications.map((n) => n.id));
    const toCancel = currentNotifications
      .filter((notification) => {
        return (
          notification.extra?.type === 'exam_reminder' &&
          !requiredIds.has(notification.id)
        );
      })
      .map((n) => n.id);

    if (toCancel.length > 0) {
      await LocalNotifications.cancel({
        notifications: toCancel.map((id) => ({ id })),
      });
      console.log(`Cancelled ${toCancel.length} outdated notifications`);
    }
  }

  private async scheduleMissingNotifications(
    currentNotifications: LocalNotificationSchema[],
    requiredNotifications: RequiredNotification[],
  ): Promise<void> {
    const currentIds = new Set(currentNotifications.map((n) => n.id));
    const toSchedule = requiredNotifications.filter(
      (notification) => !currentIds.has(notification.id),
    );

    for (const notification of toSchedule) {
      try {
        await this.scheduleExamReminder(notification);
        console.log(
          `Scheduled notification for exam: ${notification.examName}`,
        );
      } catch (error) {
        console.error(
          `Error scheduling notification for exam "${notification.examName}":`,
          error,
        );
      }
    }
  }

  private async scheduleExamReminder(
    notification: RequiredNotification,
  ): Promise<void> {
    const { id, examName, reminderDate, reminderDays, examId } = notification;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Prüfung steht an! 📚',
          body: `${examName} ${reminderDays === 1 ? 'ist morgen' : `in ${reminderDays} Tagen`}`,
          id,
          schedule: { at: reminderDate },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: {
            type: 'exam_reminder',
            examId: examId,
            examName: examName,
          },
        },
      ],
    });

    console.log(
      `Exam reminder scheduled for ${examName} at: ${reminderDate.toISOString()}`,
    );
  }

  private generateNotificationId(examId: string, examDate: Date): number {
    const examTimestamp = Math.floor(examDate.getTime() / 1000);
    const combined = `${examId}_${examTimestamp}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 1000000;
  }

  async getUpcomingExamCount(): Promise<number> {
    try {
      const upcomingExams = await this.getUpcomingExams();
      return upcomingExams.length;
    } catch (error) {
      console.error('Error loading upcoming exams:', error);
      return 0;
    }
  }

  async getScheduledNotificationCount(): Promise<number> {
    try {
      if (!Capacitor.isNativePlatform()) return 0;

      const pendingResult = await LocalNotifications.getPending();
      const examNotifications =
        pendingResult.notifications?.filter(
          (n) => n.extra?.type === 'exam_reminder',
        ) || [];

      return examNotifications.length;
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
      return 0;
    }
  }

  async manualSync(): Promise<void> {
    console.log('Manual notification sync started');
    await this.performSchedulingCheck();
    console.log('Manual notification sync completed');
  }

  async resetAndRescheduleAll(): Promise<void> {
    try {
      console.log('Resetting all notifications');
      await this.clearAllScheduledNotifications();
      await this.performSchedulingCheck();
      console.log('All notifications reset and rescheduled');
    } catch (error) {
      console.error('Error resetting notifications:', error);
      throw error;
    }
  }
}

export const notificationScheduler = NotificationScheduler.getInstance();
