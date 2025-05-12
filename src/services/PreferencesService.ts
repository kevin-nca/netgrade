import { Preferences } from '@capacitor/preferences';

export const PREFERENCE_KEYS = {
  USER_NAME: 'user_name',
} as const;

export class PreferencesService {
  /**
   * Saves the user's name to Capacitor Preferences
   * @param name - The user's name to save
   * @returns Promise<void>
   */
  static async saveName(name: string): Promise<void> {
    try {
      await Preferences.set({
        key: PREFERENCE_KEYS.USER_NAME,
        value: name,
      });
    } catch (error) {
      console.error('Failed to save user name:', error);
      throw error;
    }
  }

  /**
   * Retrieves the user's name from Capacitor Preferences
   * @returns Promise<string | null> - A promise that resolves to the user's name or null if not found
   */
  static async getName(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: PREFERENCE_KEYS.USER_NAME });
      return value;
    } catch (error) {
      console.error('Failed to get user name:', error);
      throw error;
    }
  }
}
