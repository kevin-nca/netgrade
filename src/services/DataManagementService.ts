import { getDataSource } from '@/db/data-source';
import { PreferencesService } from './PreferencesService';

export class DataManagementService {
  /**
   * Resets all application data by deleting all database entries
   * and resetting preferences
   * @returns Promise<void>
   */
  static async resetAllData(): Promise<void> {
    try {
      const dataSource = getDataSource();
      await dataSource.transaction(async (transactionManager) => {
        await transactionManager.query('DELETE FROM grade');
        await transactionManager.query('DELETE FROM exam');
        await transactionManager.query('DELETE FROM subject');
        await transactionManager.query('DELETE FROM school');
      });

      await PreferencesService.setOnboardingCompleted(false);
      await PreferencesService.saveName('');

      console.log('All data reset successfully');
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }
}
