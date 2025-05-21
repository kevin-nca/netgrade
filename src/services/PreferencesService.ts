import { Preferences } from '@capacitor/preferences';

export type PreferenceKey = 'user_name';

export interface AppPreferences {
  userName: string | null;
}

export const PREFERENCE_KEYS: Record<keyof AppPreferences, PreferenceKey> = {
  userName: 'user_name',
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
      await Preferences.set({
        key: storageKey,
        value: typeof value === 'string' ? value : JSON.stringify(value),
      });
    } catch (error) {
      console.error(`Failed to save preference ${String(key)}:`, error);
      throw error;
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
      return value as AppPreferences[K];
    } catch (error) {
      console.error(`Failed to get preference ${String(key)}:`, error);
      throw error;
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
}
