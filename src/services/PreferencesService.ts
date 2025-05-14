import { Preferences } from '@capacitor/preferences';

export interface AppPreferences {
  userName: string | null;
  onboardingCompleted: boolean;
}

/**
 * The actual storage keys in Capacitor Preferences.
 */
const PREFERENCE_KEYS = {
  userName: 'user_name',
  onboardingCompleted: 'onboarding_completed',
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
}
