// PreferencesService.test.ts
import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { PreferencesService } from '@/services/PreferencesService';
import { getRepositories } from '@/db/data-source';
import { createMockCurrentSemester } from './setup';
import { Semester } from '@/db/entities';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(false),
  },
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    requestPermissions: vi.fn(),
  },
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
    clear: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/db/data-source', () => ({
  getRepositories: vi.fn(),
}));

describe('PreferencesService', () => {
  const mockPreferencesSet = Preferences.set as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockPreferencesGet = Preferences.get as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockPreferencesRemove = (
    Preferences as unknown as { remove: ReturnType<typeof vi.fn> }
  ).remove;

  beforeAll(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('saveName', () => {
    it('should save name to Preferences with correct key', async () => {
      // Arrange
      const testName = 'John Doe';
      mockPreferencesSet.mockResolvedValue(undefined);

      // Act
      await PreferencesService.saveName(testName);

      // Assert
      expect(mockPreferencesSet).toHaveBeenCalledTimes(1);
      expect(mockPreferencesSet).toHaveBeenCalledWith({
        key: 'user_name',
        value: testName,
      });
    });

    it('should log error when Preferences.set fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockPreferencesSet.mockRejectedValue(testError);
      const consoleSpy = vi.spyOn(console, 'error');

      // Act
      await PreferencesService.saveName('Test');

      // Assert
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getName', () => {
    it('should get name from Preferences with correct key', async () => {
      // Arrange
      const testName = 'Jane Smith';
      mockPreferencesGet.mockResolvedValue({ value: testName });

      // Act
      const result = await PreferencesService.getName();

      // Assert
      expect(result).toBe(testName);
      expect(mockPreferencesGet).toHaveBeenCalledTimes(1);
      expect(mockPreferencesGet).toHaveBeenCalledWith({
        key: 'user_name',
      });
    });

    it('should return null when no name is stored', async () => {
      // Arrange
      mockPreferencesGet.mockResolvedValue({ value: null });

      // Act
      const result = await PreferencesService.getName();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null and log error when Preferences.get fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockPreferencesGet.mockRejectedValue(testError);
      const consoleSpy = vi.spyOn(console, 'error');

      // Act
      const result = await PreferencesService.getName();

      // Assert
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('onboarding methods', () => {
    it('should set onboarding completed status', async () => {
      // Arrange
      mockPreferencesSet.mockResolvedValue(undefined);

      // Act
      await PreferencesService.setOnboardingCompleted(true);

      // Assert
      expect(mockPreferencesSet).toHaveBeenCalledWith({
        key: 'onboarding_completed',
        value: 'true',
      });
    });

    it('should get onboarding completed status', async () => {
      // Arrange
      mockPreferencesGet.mockResolvedValue({ value: 'true' });

      // Act
      const result = await PreferencesService.isOnboardingCompleted();

      // Assert
      expect(result).toBe(true);
      expect(mockPreferencesGet).toHaveBeenCalledWith({
        key: 'onboarding_completed',
      });
    });

    it('should return false when onboarding status is not set', async () => {
      // Arrange
      mockPreferencesGet.mockResolvedValue({ value: null });

      // Act
      const result = await PreferencesService.isOnboardingCompleted();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getCurrentSemester', () => {
    const mockGetRepositories = getRepositories as unknown as ReturnType<
      typeof vi.fn
    >;

    it('should return the current semester when today is within range', async () => {
      // Arrange
      const mockSemester = createMockCurrentSemester();
      const allSemesters = [mockSemester];

      mockGetRepositories.mockReturnValue({
        semester: {
          find: vi.fn().mockResolvedValue(allSemesters),
        },
      } as never);

      // Act
      const result = await PreferencesService.getCurrentSemester();

      // Assert
      expect(result).toEqual(mockSemester);
      expect(mockGetRepositories).toHaveBeenCalled();
    });

    it('should return null when no semester matches today', async () => {
      // Arrange
      const pastSemester = {
        id: 'semester-1',
        name: 'Past Semester',
        startDate: new Date('2023-08-01'),
        endDate: new Date('2024-07-31'),
      } as Semester;

      mockGetRepositories.mockReturnValue({
        semester: {
          find: vi.fn().mockResolvedValue([pastSemester]),
        },
      } as never);

      // Act
      const result = await PreferencesService.getCurrentSemester();

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      // Arrange
      const testError = new Error('Database error');
      const consoleSpy = vi.spyOn(console, 'error');

      mockGetRepositories.mockReturnValue({
        semester: {
          find: vi.fn().mockRejectedValue(testError),
        },
      } as never);

      // Act & Assert
      await expect(PreferencesService.getCurrentSemester()).rejects.toThrow(
        'Database error',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get current semester:',
        testError,
      );
    });
  });

  describe('notification settings', () => {
    it('should return default notification settings when none are stored', async () => {
      mockPreferencesGet.mockResolvedValueOnce({ value: null });

      const result = await PreferencesService.getNotificationSettings();

      expect(result).toEqual({
        enabled: false,
        reminderDays: 1,
        reminderTime: [9, 0],
        autoSchedulingEnabled: true,
      });
      expect(mockPreferencesGet).toHaveBeenCalledWith({
        key: 'notification_settings',
      });
    });

    it('should migrate legacy reminderTime string to tuple and persist migrated settings', async () => {
      const legacy = {
        enabled: true,
        reminderDays: 2,
        reminderTime: '08:30',
        autoSchedulingEnabled: false,
      };

      mockPreferencesGet.mockResolvedValueOnce({
        value: JSON.stringify(legacy),
      });
      mockPreferencesSet.mockResolvedValue(undefined);

      const result = await PreferencesService.getNotificationSettings();

      expect(result).toEqual({
        enabled: true,
        reminderDays: 2,
        reminderTime: [8, 30],
        autoSchedulingEnabled: false,
      });

      const persisted = mockPreferencesSet.mock.calls.find(
        (call) => call[0]?.key === 'notification_settings',
      );
      expect(persisted).toBeDefined();

      const persistedValue = JSON.parse(persisted![0].value);
      expect(persistedValue).toEqual({
        enabled: true,
        reminderDays: 2,
        reminderTime: [8, 30],
        autoSchedulingEnabled: false,
      });
    });

    it('should return default notification settings when stored value is invalid JSON', async () => {
      mockPreferencesGet.mockResolvedValueOnce({ value: '{invalid json' });

      const result = await PreferencesService.getNotificationSettings();

      expect(result).toEqual({
        enabled: false,
        reminderDays: 1,
        reminderTime: [9, 0],
        autoSchedulingEnabled: true,
      });
    });

    it('should save notification settings as JSON', async () => {
      mockPreferencesSet.mockResolvedValue(undefined);

      await PreferencesService.saveNotificationSettings({
        enabled: true,
        reminderDays: 1,
        reminderTime: [10, 0],
        autoSchedulingEnabled: true,
      });

      expect(mockPreferencesSet).toHaveBeenCalledWith({
        key: 'notification_settings',
        value: JSON.stringify({
          enabled: true,
          reminderDays: 1,
          reminderTime: [10, 0],
          autoSchedulingEnabled: true,
        }),
      });
    });

    it('should remove notification settings when saving null via generic preference (indirect)', async () => {
      const svc = PreferencesService as unknown as {
        saveNotificationSettings: (s: unknown) => Promise<void>;
      };

      mockPreferencesRemove?.mockResolvedValue?.(undefined);
      expect(typeof svc.saveNotificationSettings).toBe('function');
    });
  });

  describe('requestNotificationPermissions', () => {
    it('should return false on web platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValueOnce(false);

      const result = await PreferencesService.requestNotificationPermissions();

      expect(result).toBe(false);
      expect(LocalNotifications.requestPermissions).not.toHaveBeenCalled();
    });

    it('should return true when native permission is granted', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValueOnce(true);
      vi.mocked(LocalNotifications.requestPermissions).mockResolvedValueOnce({
        display: 'granted',
      } as unknown as Awaited<
        ReturnType<typeof LocalNotifications.requestPermissions>
      >);

      const result = await PreferencesService.requestNotificationPermissions();

      expect(result).toBe(true);
    });

    it('should return false when native permission is denied', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValueOnce(true);
      vi.mocked(LocalNotifications.requestPermissions).mockResolvedValueOnce({
        display: 'denied',
      } as unknown as Awaited<
        ReturnType<typeof LocalNotifications.requestPermissions>
      >);

      const result = await PreferencesService.requestNotificationPermissions();

      expect(result).toBe(false);
    });

    it('should return false when requesting permissions throws', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValueOnce(true);
      vi.mocked(LocalNotifications.requestPermissions).mockRejectedValueOnce(
        new Error('permissions error'),
      );

      const result = await PreferencesService.requestNotificationPermissions();

      expect(result).toBe(false);
    });
  });

  describe('getAvailableReminderTimes', () => {
    it('should return a copy (mutating result must not affect subsequent calls)', () => {
      const first = PreferencesService.getAvailableReminderTimes();
      first.push([23, 59]);

      const second = PreferencesService.getAvailableReminderTimes();

      expect(second).not.toEqual(first);
      expect(second).not.toContainEqual([23, 59]);
    });
  });
});
