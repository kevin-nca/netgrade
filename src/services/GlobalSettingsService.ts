import { getDataSource } from '@/db/data-source';

export interface Settings {
  name: string;
  notification: boolean;
  language: string;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  name: 'Gabriele',
  notification: false,
  language: 'de',
  darkMode: false,
};

export class GlobalSettingsService {
  /**
   * Fetches current settings from storage
   * @returns Promise<Settings> - A promise that resolves to the current settings
   */
  static async getSettings(): Promise<Settings> {
    try {
      // placeholder
      return { ...DEFAULT_SETTINGS };
    } catch (error) {
      console.error('Failed to get settings:', error);
      throw error;
    }
  }

  /**
   * Saves settings to storage
   * @param settings - The settings to save
   * @returns Promise<Settings> - A promise that resolves to the saved settings
   */
  static async saveSettings(settings: Settings): Promise<Settings> {
    try {
      // placeholder for real implementation
      console.log('Saving settings:', settings);
      return { ...settings };
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Resets all application data, including database entries and settings
   * @param onResetComplete - Optional callback to run after data is reset
   * @returns Promise<void>
   */
  static async resetAllData(
    onResetComplete?: () => Promise<void>,
  ): Promise<void> {
    try {
      const dataSource = getDataSource();
      await dataSource.transaction(async (transactionManager) => {
        await transactionManager.query('DELETE FROM grade');
        await transactionManager.query('DELETE FROM exam');
        await transactionManager.query('DELETE FROM subject');
        await transactionManager.query('DELETE FROM school');
      });

      await this.saveSettings({ ...DEFAULT_SETTINGS, name: '' });

      if (onResetComplete) {
        await onResetComplete();
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }

  /**
   * Requests a password reset for the user
   * @param email - Optional email to send the reset to (can be omitted if using current user)
   * @returns Promise<void>
   */
  static async requestPasswordReset(email?: string): Promise<void> {
    try {
      // placeholder for pass implementation
      console.log('Password reset requested for:', email || 'current user');
    } catch (error) {
      console.error('Failed to request password reset:', error);
      throw error;
    }
  }
}
