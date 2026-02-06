import { getDataSource, getRepositories } from '@/db/data-source';
import { School } from '@/db/entities';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Result of a backup operation
 */
export interface BackupResult {
  success: boolean;
  message: string;
  filename?: string;
}

/**
 * Custom error class for backup operations
 */
export class BackupError extends Error {
  constructor(
    message: string,
    public code:
      | 'INVALID_DATA'
      | 'SAVE_FAILED'
      | 'SHARE_FAILED'
      | 'PARSE_FAILED'
      | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

export class BackupService {
  /**
   * Export all data as JSON backup
   */
  static async exportAsJSON(): Promise<BackupResult> {
    try {
      const schools = await getRepositories().school.find({
        relations: { subjects: { exams: { grade: true } } },
      });

      if (schools.length === 0) {
        throw new BackupError(
          'Keine Daten zum Exportieren vorhanden.',
          'INVALID_DATA',
        );
      }

      const json = JSON.stringify(
        { schools },
        (key, value) => {
          if (value instanceof Date) {
            return value.toISOString().split('T')[0];
          }
          return value;
        },
        2,
      );

      const filename = `netgrade_backup_${new Date().toISOString().split('T')[0]}.json`;
      const blob = new Blob([json], { type: 'application/json' });

      if (Capacitor.isNativePlatform()) {
        return await this.exportNativeJSON(blob, filename);
      } else {
        return this.exportWebJSON(blob, filename);
      }
    } catch (error) {
      console.error('JSON export failed:', error);

      if (error instanceof BackupError) {
        throw error;
      }

      throw new BackupError(
        'Backup-Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
        'UNKNOWN',
      );
    }
  }

  /**
   * Import data from JSON backup
   */
  static async importFromJSON(jsonString: string): Promise<void> {
    try {
      const parsed = JSON.parse(jsonString, (key, value) => {
        if (key === 'date' && typeof value === 'string') {
          return new Date(value);
        }
        return value;
      });

      if (!parsed.schools || !Array.isArray(parsed.schools)) {
        throw new BackupError(
          'Ungültiges Backup-Format. Die Datei enthält keine Schuldaten.',
          'INVALID_DATA',
        );
      }

      const { schools } = parsed;

      const dataSource = getDataSource();
      await dataSource.transaction(async (transactionManager) => {
        await transactionManager.query('DELETE FROM grade');
        await transactionManager.query('DELETE FROM exam');
        await transactionManager.query('DELETE FROM subject');
        await transactionManager.query('DELETE FROM school');
        await transactionManager.getRepository(School).save(schools);
      });
    } catch (error) {
      console.error('JSON import failed:', error);

      if (error instanceof BackupError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new BackupError(
          'Die Backup-Datei ist beschädigt oder ungültig.',
          'PARSE_FAILED',
        );
      }

      throw new BackupError(
        'Backup-Import fehlgeschlagen. Bitte versuchen Sie es erneut.',
        'UNKNOWN',
      );
    }
  }

  /**
   * Export JSON for native platforms
   */
  private static async exportNativeJSON(
    blob: Blob,
    filename: string,
  ): Promise<BackupResult> {
    try {
      const base64Data = await this.blobToBase64(blob);

      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
      });

      const fileUri = await Filesystem.getUri({
        path: filename,
        directory: Directory.Documents,
      });

      try {
        await Share.share({
          title: 'NetGrade Backup',
          text: 'NetGrade-Datensicherung als JSON-Datei.',
          url: fileUri.uri,
          dialogTitle: 'NetGrade Backup teilen',
        });

        return {
          success: true,
          message: 'Backup erfolgreich erstellt und geteilt.',
          filename,
        };
      } catch (shareError) {
        if (this.isShareCancelled(shareError)) {
          return {
            success: true,
            message: 'Vorgang abgebrochen. Backup wurde gespeichert.',
            filename,
          };
        }
        throw shareError;
      }
    } catch (error) {
      console.error('Native JSON export failed:', error);
      const message = this.getErrorMessage(error);
      throw new BackupError(message, 'SAVE_FAILED');
    }
  }

  /**
   * Export JSON for web platforms
   */
  private static exportWebJSON(blob: Blob, filename: string): BackupResult {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Backup erfolgreich heruntergeladen.',
        filename,
      };
    } catch (error) {
      console.error('Web JSON export failed:', error);
      throw new BackupError('Backup-Download fehlgeschlagen.', 'SAVE_FAILED');
    }
  }

  /**
   * Convert blob to base64
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Check if share was cancelled
   */
  private static isShareCancelled(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('cancelled') ||
        error.message.includes('canceled')
      );
    }
    return false;
  }

  /**
   * Get user-friendly error message
   */
  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('file') || error.message.includes('File')) {
        return 'Datei konnte nicht gespeichert werden. Versuchen Sie es erneut.';
      }
      if (error.message.includes('permission')) {
        return 'Keine Berechtigung zum Speichern von Dateien.';
      }
      return 'Datei wurde gespeichert, Teilen war nicht möglich.';
    }
    return 'Unbekannter Fehler beim Backup.';
  }
}
