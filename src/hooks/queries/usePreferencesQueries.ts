import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PreferencesService, NotificationSettings } from '@/services';
import { notificationScheduler } from '@/notification-scheduler';

export const preferencesKeys = {
  all: ['preferences'] as const,
  userName: () => [...preferencesKeys.all, 'userName'] as const,
  onboardingCompleted: () =>
    [...preferencesKeys.all, 'onboardingCompleted'] as const,
  notificationSettings: () =>
    [...preferencesKeys.all, 'notificationSettings'] as const,
  notificationPermissions: () =>
    [...preferencesKeys.all, 'notificationPermissions'] as const,
  schedulerStatus: () => [...preferencesKeys.all, 'schedulerStatus'] as const,
  availableReminderTimes: () =>
    [...preferencesKeys.all, 'availableReminderTimes'] as const,
};

export const useUserName = () => {
  return useQuery({
    queryKey: preferencesKeys.userName(),
    queryFn: () => PreferencesService.getName(),
  });
};

export const useSaveUserName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => PreferencesService.saveName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferencesKeys.userName() });
    },
  });
};

export const useOnboardingCompleted = () => {
  return useQuery({
    queryKey: preferencesKeys.onboardingCompleted(),
    queryFn: () => PreferencesService.isOnboardingCompleted(),
  });
};

export const useSetOnboardingCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (completed: boolean) =>
      PreferencesService.setOnboardingCompleted(completed),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.onboardingCompleted(),
      });
    },
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: preferencesKeys.notificationSettings(),
    queryFn: () => PreferencesService.getNotificationSettings(),
    staleTime: 1000 * 60,
  });
};

export const useSaveNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      await PreferencesService.saveNotificationSettings(settings);
      return settings;
    },
    onSuccess: async (savedSettings) => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.notificationSettings(),
      });
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.schedulerStatus(),
      });
      try {
        notificationScheduler.stop();
        if (savedSettings.enabled) {
          await notificationScheduler.start();
          console.log('Scheduler restarted after settings change');
        } else {
          console.log('Scheduler stopped due to disabled notifications');
        }
      } catch (error) {
        console.error(
          'Error restarting scheduler after settings change:',
          error,
        );
      }
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: preferencesKeys.schedulerStatus(),
        });
      }, 500);
    },
  });
};
export const useNotificationPermissions = () => {
  return useQuery({
    queryKey: preferencesKeys.notificationPermissions(),
    queryFn: () => PreferencesService.requestNotificationPermissions(),
    staleTime: 1000 * 60 * 5,
    enabled: false,
  });
};
export const useSchedulerStatus = () => {
  return useQuery({
    queryKey: preferencesKeys.schedulerStatus(),
    queryFn: async () => {
      const [upcomingExams, scheduledNotifications] = await Promise.all([
        notificationScheduler.getUpcomingExamCount(),
        notificationScheduler.getScheduledNotificationCount(),
      ]);

      return {
        isRunning: notificationScheduler.isSchedulerRunning(),
        upcomingExams,
        scheduledNotifications,
      };
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};
export const useAvailableReminderTimes = () => {
  return useQuery({
    queryKey: preferencesKeys.availableReminderTimes(),
    queryFn: () => PreferencesService.getAvailableReminderTimes(),
    staleTime: Infinity,
  });
};
export const useManualNotificationSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationScheduler.manualSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.schedulerStatus(),
      });
    },
  });
};

export const useResetNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationScheduler.resetAndRescheduleAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.schedulerStatus(),
      });
    },
  });
};
