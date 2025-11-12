import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { NotificationSettings, PreferencesService } from '@/services';
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

export const UserNameQuery = {
  queryKey: preferencesKeys.userName(),
  queryFn: () => PreferencesService.getName(),
  staleTime: Infinity,
} as const;

export const useUserName = () => {
  return useQuery(UserNameQuery);
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

export const OnboardingCompletedQuery = {
  queryKey: preferencesKeys.onboardingCompleted() as QueryKey,
  queryFn: () => PreferencesService.isOnboardingCompleted(),
  staleTime: Infinity,
} as const;

export const useOnboardingCompleted = () => {
  return useQuery(OnboardingCompletedQuery);
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

export const NotificationSettingsQuery = {
  queryKey: preferencesKeys.notificationSettings(),
  queryFn: () => PreferencesService.getNotificationSettings(),
  staleTime: Infinity,
} as const;

export const useNotificationSettings = () => {
  return useQuery(NotificationSettingsQuery);
};

export const useSaveNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      await PreferencesService.saveNotificationSettings(settings);
      return settings;
    },
    onSuccess: async (savedSettings) => {
      queryClient.setQueryData(
        preferencesKeys.notificationSettings(),
        savedSettings,
      );
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.schedulerStatus(),
      });
      try {
        console.log('Settings saved, triggering immediate sync');
        await notificationScheduler.manualSync();
        console.log('Immediate sync completed after settings change');
      } catch (error) {
        console.error(
          'Error during immediate sync after settings change:',
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
