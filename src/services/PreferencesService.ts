import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getRepositories } from '@/db/data-source';
import { Semester } from '@/db/entities/Semester';

export interface AppPreferences {
  userName: string | null;
  onboardingCompleted: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderDays: number;
  reminderTime: [number, number];
  autoSchedulingEnabled: boolean;
}

interface LegacyNotificationSettings {
  enabled: boolean;
  reminderDays: number;
  reminderTime: string;
  autoSchedulingEnabled: boolean;
}

/**
 * The actual storage keys in Capacitor Preferences.
 */
const PREFERENCE_KEYS = {
  userName: 'user_name',
  onboardingCompleted: 'onboarding_completed',
  notificationSettings: 'notification_settings',
} as const;

export type PreferenceKey =
  (typeof PREFERENCE_KEYS)[keyof typeof PREFERENCE_KEYS];

/**
 * Map each AppPreferences property to:
 *  - the storage key
 *  - how to serialize a non-null value
 *  - how to parse a returned string (or null) into the correct T
 */
const preferenceDefinitions: {
  [K in keyof AppPreferences]: {
    storageKey: PreferenceKey;
    serialize: (value: NonNullable<AppPreferences[K]>) => string;
    parse: (stored: string | null) => AppPreferences[K];
  };
} = {
  userName: {
    storageKey: PREFERENCE_KEYS.userName,
    serialize: (v) => v,
    parse: (s) => s,
  },
  onboardingCompleted: {
    storageKey: PREFERENCE_KEYS.onboardingCompleted,
    serialize: (v) => String(v),
    parse: (s) => s === 'true',
  },
};

export class PreferencesService {
  private static readonly DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings =
    {
      enabled: false,
      reminderDays: 1,
      reminderTime: [9, 0],
      autoSchedulingEnabled: true,
    };

  private static readonly AVAILABLE_REMINDER_TIMES: [number, number][] = [
    [8, 0],
    [9, 0],
    [10, 0],
    [12, 0],
    [18, 0],
    [20, 0],
  ];

  /**
   * Persist the given username in Capacitor Preferences.
   *
   * @param name - The user's name to store. Must be a non-empty string.
   * @returns A promise that resolves once the name has been saved.
   */
  static saveName(name: string): Promise<void> {
    return this.setPreference('userName', name);
  }

  /**
   * Retrieve the stored username from Capacitor Preferences.
   *
   * @returns A promise that resolves to the saved username,
   *          or `null` if no name has been stored.
   */
  static getName(): Promise<string | null> {
    return this.getPreference('userName');
  }

  /**
   * Mark onboarding as completed or not in Capacitor Preferences.
   *
   * @param completed - `true` if onboarding is done; `false` otherwise.
   * @returns A promise that resolves once the status has been saved.
   */
  static setOnboardingCompleted(completed: boolean): Promise<void> {
    return this.setPreference('onboardingCompleted', completed);
  }

  /**
   * Check whether the user has completed onboarding.
   *
   * @returns A promise that resolves to `true` if onboarding was completed,
   *          or `false` if not (or if no value was previously stored).
   */
  static isOnboardingCompleted(): Promise<boolean> {
    return this.getPreference('onboardingCompleted');
  }

  /**
   * Get notification settings, returns defaults if none set
   * Handles migration from old string format to new tuple format
   */
  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await this.getGenericPreference<
        NotificationSettings | LegacyNotificationSettings
      >(PREFERENCE_KEYS.notificationSettings);
      if (!settings) {
        return this.DEFAULT_NOTIFICATION_SETTINGS;
      }
      if (typeof settings.reminderTime === 'string') {
        const legacySettings = settings as LegacyNotificationSettings;
        const [hours, minutes] = legacySettings.reminderTime
          .split(':')
          .map(Number);
        const migratedSettings: NotificationSettings = {
          enabled: legacySettings.enabled,
          reminderDays: legacySettings.reminderDays,
          autoSchedulingEnabled: legacySettings.autoSchedulingEnabled,
          reminderTime: [hours, minutes],
        };
        await this.saveNotificationSettings(migratedSettings);
        return migratedSettings;
      }

      return settings as NotificationSettings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  /**
   * Save notification settings
   */
  static async saveNotificationSettings(
    settings: NotificationSettings,
  ): Promise<void> {
    try {
      await this.setGenericPreference(
        PREFERENCE_KEYS.notificationSettings,
        settings,
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  static async requestNotificationPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not available in web');
      return false;
    }

    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get available reminder times (static data)
   */
  static getAvailableReminderTimes(): [number, number][] {
    return [...this.AVAILABLE_REMINDER_TIMES];
  }

  /**
   * Gets the current active semester based on today's date
   * @returns Promise<Semester | null> - The current semester or null if none found
   */
  static async getCurrentSemester(): Promise<Semester | null> {
    try {
      const { semester: semesterRepo } = getRepositories();
      const today = new Date();

      const semesters = await semesterRepo.find();

      const currentSemester = semesters.find((semester) => {
        const start = new Date(semester.startDate);
        const end = new Date(semester.endDate);

        return start <= today && today <= end;
      });

      return currentSemester || null;
    } catch (error) {
      console.error('Failed to get current semester:', error);
      throw error;
    }
  }

  private static async setPreference<K extends keyof AppPreferences>(
    key: K,
    value: NonNullable<AppPreferences[K]>,
  ): Promise<void> {
    const def = preferenceDefinitions[key];
    try {
      await Preferences.set({
        key: def.storageKey,
        value: def.serialize(value),
      });
    } catch (err) {
      console.error(`Error setting ${key}:`, err);
    }
  }

  private static async getPreference<K extends keyof AppPreferences>(
    key: K,
  ): Promise<AppPreferences[K]> {
    const def = preferenceDefinitions[key];
    try {
      const { value } = await Preferences.get({ key: def.storageKey });
      return def.parse(value);
    } catch (err) {
      console.error(`Error getting ${key}:`, err);
      return def.parse(null);
    }
  }

  /**
   * Stores JSON-serializable data under a key
   */
  private static async setGenericPreference<T>(
    key: string,
    value: T | null | undefined,
  ): Promise<void> {
    if (value === null || value === undefined) {
      await Preferences.remove({ key });
    } else {
      await Preferences.set({
        key,
        value: JSON.stringify(value),
      });
    }
  }

  /**
   * Loads JSON-serializable data from a key
   */
  private static async getGenericPreference<T = unknown>(
    key: string,
  ): Promise<T | null> {
    const result = await Preferences.get({ key });
    if (result.value === null) {
      return null;
    }
    try {
      return JSON.parse(result.value) as T;
    } catch (error) {
      console.error(`Error parsing preference ${key}:`, error);
      return null;
    }
  }
}
