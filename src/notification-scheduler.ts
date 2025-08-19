import { ExamService } from './services';
import { PreferencesService, NotificationSettings } from './services';
import {
  LocalNotifications,
  LocalNotificationSchema,
} from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
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

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    const settings = await PreferencesService.getNotificationSettings();
    if (!settings.enabled || !Capacitor.isNativePlatform()) {
      console.log(
        'Notification scheduler not started - notifications disabled or not native platform',
      );
      return;
    }

    this.isRunning = true;
    await this.checkAndScheduleNotifications();

    this.intervalId = window.setInterval(async () => {
      try {
        await this.checkAndScheduleNotifications();
      } catch (error) {
        console.error('Error in automatic notification scheduling:', error);
      }
    }, this.CHECK_INTERVAL);

    console.log('Notification scheduler started');
  }

  stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Notification scheduler stopped');
  }

  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Stateless notification scheduling - computes required state on each run
   */
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

      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
      reminderDate.setHours(hours, minutes, 0, 0);
      if (reminderDate > now) {
        const notificationId = this.generateNotificationId(
          exam.id,
          settings.reminderDays,
        );

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

  /**
   * Schedule exam reminder notification (moved from service to scheduler)
   */
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

  private generateNotificationId(examId: string, reminderDays: number): number {
    const combined = `${examId}_${reminderDays}`;
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
    await this.checkAndScheduleNotifications();
    console.log('Manual notification sync completed');
  }

  async resetAndRescheduleAll(): Promise<void> {
    try {
      console.log('Resetting all notifications');
      if (Capacitor.isNativePlatform()) {
        const pendingResult = await LocalNotifications.getPending();
        const examNotifications =
          pendingResult.notifications?.filter(
            (n) => n.extra?.type === 'exam_reminder',
          ) || [];

        if (examNotifications.length > 0) {
          const idsToCancel = examNotifications.map((n) => ({ id: n.id }));
          await LocalNotifications.cancel({ notifications: idsToCancel });
          console.log(`Cancelled ${idsToCancel.length} existing notifications`);
        }
      }
      await this.checkAndScheduleNotifications();
      console.log('All notifications reset and rescheduled');
    } catch (error) {
      console.error('Error resetting notifications:', error);
      throw error;
    }
  }
}

export const notificationScheduler = NotificationScheduler.getInstance();
