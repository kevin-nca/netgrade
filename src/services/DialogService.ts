import { AlertButton, AlertOptions } from '@ionic/react';

/**
 * Service for creating dialog configurations
 */
export class DialogService {
  /**
   * Creates a configuration for the reset data confirmation dialog
   * @param onReset - The function to call when the reset button is clicked
   * @returns AlertOptions - The configuration for the alert dialog
   */
  static getResetDataConfirmation(onReset: () => Promise<void>): AlertOptions {
    try {
      const cancelButton: AlertButton = {
        text: 'Abbrechen',
        role: 'cancel',
      };

      const resetButton: AlertButton = {
        text: 'Zurücksetzen',
        role: 'destructive',
        handler: onReset,
      };

      return {
        header: 'Daten zurücksetzen',
        message:
          'Möchten Sie wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.',
        buttons: [cancelButton, resetButton],
      };
    } catch (error) {
      console.error('Error creating reset confirmation dialog:', error);
      throw error;
    }
  }
}
