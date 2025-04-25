export interface UserSettings {
  name: string;
  language: string;
  notifications: boolean;
  darkMode: boolean;
}

export class SettingsService {
  static loadSettings(): UserSettings {
    return {
      name: '',
      language: 'de',
      notifications: false,
      darkMode: false,
    };
  }

  static saveSettings(): boolean {
    try {
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      return false;
    }
  }

  static applyLanguage(language: string): void {
    document.documentElement.setAttribute('lang', language);
    // placeholder for language :)
  }
}
