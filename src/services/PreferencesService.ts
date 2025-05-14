import { Preferences } from '@capacitor/preferences';

export type PreferenceKey = 'user_name' | 'onboarding_completed';

export interface AppPreferences {
  userName: string | null;
  onboardingCompleted: boolean;
}

export const PREFERENCE_KEYS: Record<keyof AppPreferences, PreferenceKey> = {
  userName: 'user_name',
  onboardingCompleted: 'onboarding_completed',
};

export class PreferencesService {
  /**
   * Generic method to save a preference
   */
  private static async setPreference<K extends keyof AppPreferences>(
    key: K,
    value: NonNullable<AppPreferences[K]>,
  ): Promise<void> {
    try {
      const storageKey = PREFERENCE_KEYS[key];
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await Preferences.set({ key: storageKey, value: stringValue });
    } catch (error) {
      console.error(`Failed to save preference ${String(key)}:`, error);
    }
  }

  /**
   * Generic method to get a preference
   */
  private static async getPreference<K extends keyof AppPreferences>(
    key: K,
  ): Promise<AppPreferences[K]> {
    try {
      const storageKey = PREFERENCE_KEYS[key];
      const { value } = await Preferences.get({ key: storageKey });
      if (value === null) {
        return (
          key === 'onboardingCompleted' ? false : null
        ) as AppPreferences[K];
      }
      return (
        key === 'onboardingCompleted' ? value === 'true' : value
      ) as AppPreferences[K];
    } catch (error) {
      console.error(`Failed to get preference ${String(key)}:`, error);
      return (
        key === 'onboardingCompleted' ? false : null
      ) as AppPreferences[K];
    }
  }

  /**
   * Saves the user's name to Capacitor Preferences
   */
  static async saveName(name: string): Promise<void> {
    return this.setPreference('userName', name);
  }

  /**
   * Retrieves the user's name from Capacitor Preferences
   */
  static async getName(): Promise<string | null> {
    return this.getPreference('userName');
  }

  /**
   * Sets the onboarding completion status
   * @param completed Whether onboarding has been completed
   */
  static async setOnboardingCompleted(completed: boolean): Promise<void> {
    return this.setPreference('onboardingCompleted', completed);
  }

  /**
   * Checks if onboarding has been completed
   * @returns True if onboarding is completed, false otherwise
   */
  static async isOnboardingCompleted(): Promise<boolean> {
    return this.getPreference('onboardingCompleted');
  }
}
