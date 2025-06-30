import { PreferencesService } from './PreferencesService';
import { getDataSource, getRepositories } from '@/db/data-source';
import { School } from '@/db/entities';
import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Result of an export operation
 */
export interface ExportResult {
  success: boolean;
  message: string;
  filename?: string;
}

/**
 * Supported export formats
 */
export type ExportFormat = 'xlsx';

/**
 * Options for configuring the export
 */
export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  schoolId: string | 'all';
}

/**
 * Custom error class for export operations
 */
export class ExportError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_DATA' | 'SAVE_FAILED' | 'SHARE_FAILED' | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

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
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }

  /**
   * Main export method that handles all platforms
   * @param options - Export options including format, filename, and schoolId ('all' for all schools)
   * @returns Promise<ExportResult> - Result of the export operation
   */
  static async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      const { school: schoolRepo } = getRepositories();

      let schools: School[];

      if (options.schoolId === 'all') {
        schools = await schoolRepo.find({
          relations: {
            subjects: {
              exams: {
                grade: true,
              },
            },
          },
          order: { name: 'ASC' },
        });

        if (schools.length === 0) {
          throw new ExportError('Keine Schulen gefunden.', 'INVALID_DATA');
        }
      } else {
        const school = await schoolRepo.findOne({
          where: { id: options.schoolId },
          relations: {
            subjects: {
              exams: {
                grade: true,
              },
            },
          },
        });

        if (!school) {
          throw new ExportError('Schule nicht gefunden.', 'INVALID_DATA');
        }

        schools = [school];
      }

      const content = this.formatData(schools, options.format);
      const blob = this.createBlob(content, options.format);

      if (Capacitor.isNativePlatform()) {
        return await this.exportNative(blob, options.filename);
      } else {
        return this.exportWeb(blob, options.filename);
      }
    } catch (error) {
      console.error('Export failed:', error);

      if (error instanceof ExportError) {
        throw error;
      }

      throw new ExportError(
        'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
        'UNKNOWN',
      );
    }
  }

  /**
   * Create blob from content based on format
   */
  private static createBlob(content: string, format: ExportFormat): Blob {
    switch (format) {
      case 'xlsx': {
        const binaryString = atob(content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      }
      default:
        return new Blob([content], { type: 'text/plain' });
    }
  }

  /**
   * Export for web platforms
   */
  private static exportWeb(blob: Blob, filename: string): ExportResult {
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
        message: 'Export erfolgreich heruntergeladen.',
        filename,
      };
    } catch (error) {
      console.error('Download failed:', error);
      throw new ExportError('Download fehlgeschlagen.', 'SAVE_FAILED');
    }
  }

  /**
   * Export for native platforms with sharing
   */
  private static async exportNative(
    blob: Blob,
    filename: string,
  ): Promise<ExportResult> {
    try {
      const base64Data = await this.blobToBase64(blob);
      const properFilename = filename.endsWith('.xlsx')
        ? filename
        : `${filename}.xlsx`;

      await Filesystem.writeFile({
        path: properFilename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      await Filesystem.stat({
        path: properFilename,
        directory: Directory.Documents,
      });

      const fileUri = await Filesystem.getUri({
        path: properFilename,
        directory: Directory.Documents,
      });

      try {
        await Share.share({
          title: 'NetGrade Export',
          text: 'NetGrade-Datenexport als Excel-Datei.',
          url: fileUri.uri,
          dialogTitle: 'NetGrade Export teilen',
        });

        return {
          success: true,
          message: 'Datei erfolgreich geteilt.',
          filename: properFilename,
        };
      } catch (shareError) {
        if (this.isShareCancelled(shareError)) {
          return {
            success: true,
            message: 'Vorgang abgebrochen. Datei wurde gespeichert.',
            filename: properFilename,
          };
        }
        throw shareError;
      }
    } catch (error) {
      console.error('Native export failed:', error);

      const message = this.getErrorMessage(error);
      throw new ExportError(message, 'SAVE_FAILED');
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
        return 'Datei konnte nicht geöffnet werden. Versuchen Sie es erneut.';
      }
      if (error.message.includes('permission')) {
        return 'Keine Berechtigung zum Speichern von Dateien.';
      }
      return 'Datei wurde gespeichert, Teilen war nicht möglich.';
    }
    return 'Unbekannter Fehler beim Export.';
  }

  /**
   * Formats the schools data according to the specified format
   * @param schools - Array of school entities with all relations loaded
   * @param exportFormat - The desired format
   * @returns string - The formatted data
   */
  private static formatData(
    schools: School[],
    exportFormat: ExportFormat,
  ): string {
    switch (exportFormat) {
      case 'xlsx':
        return this.formatAsXlsx(schools);
      default:
        throw new Error(`Unsupported format: ${exportFormat}`);
    }
  }

  /**
   * Format data as XLSX for single or multiple schools
   */
  private static formatAsXlsx(schools: School[]): string {
    const workbook = XLSX.utils.book_new();

    if (schools.length === 1) {
      return this.formatSingleSchoolAsXlsx(schools[0]);
    }

    const overviewData = [
      ['NetGrade Datenexport - Alle Schulen'],
      ['Exportiert am:', new Date().toLocaleDateString('de-DE')],
      ['Anzahl Schulen:', schools.length.toString()],
      [''],
      [
        'Schule',
        'Anzahl Fächer',
        'Anzahl Prüfungen',
        'Abgeschlossene Prüfungen',
        'Durchschnittsnote',
      ],
      ...schools.map((school) => {
        const totalSubjects = school.subjects.length;
        const totalExams = school.subjects.reduce(
          (sum, subject) => sum + subject.exams.length,
          0,
        );
        const completedExams = school.subjects.reduce(
          (sum, subject) =>
            sum + subject.exams.filter((exam) => exam.isCompleted).length,
          0,
        );

        const completedGrades = school.subjects.flatMap((subject) =>
          subject.exams
            .filter((exam) => exam.isCompleted && exam.grade)
            .map((exam) => exam.grade!),
        );

        const averageGrade =
          completedGrades.length > 0
            ? (
                completedGrades.reduce(
                  (sum, grade) => sum + grade.score * grade.weight,
                  0,
                ) /
                completedGrades.reduce((sum, grade) => sum + grade.weight, 0)
              ).toFixed(2)
            : '-';

        return [
          school.name,
          totalSubjects.toString(),
          totalExams.toString(),
          completedExams.toString(),
          averageGrade,
        ];
      }),
    ];

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Übersicht');

    const allSchoolsData = [
      ['Schule', 'Name', 'Adresse', 'Typ', 'Erstellt am'],
      ...schools.map((school) => [
        school.name,
        school.name,
        school.address || '',
        school.type || '',
        school.createdAt.toLocaleDateString('de-DE'),
      ]),
    ];
    const allSchoolsSheet = XLSX.utils.aoa_to_sheet(allSchoolsData);
    XLSX.utils.book_append_sheet(workbook, allSchoolsSheet, 'Alle Schulen');

    const allSubjectsData = [
      ['Schule', 'Fach', 'Lehrer', 'Beschreibung', 'Gewichtung', 'Erstellt am'],
      ...schools.flatMap((school) =>
        school.subjects.map((subject) => [
          school.name,
          subject.name,
          subject.teacher || '',
          subject.description || '',
          subject.weight || 1,
          subject.createdAt.toLocaleDateString('de-DE'),
        ]),
      ),
    ];
    const allSubjectsSheet = XLSX.utils.aoa_to_sheet(allSubjectsData);
    XLSX.utils.book_append_sheet(workbook, allSubjectsSheet, 'Alle Fächer');

    const allExamsData = [
      [
        'Schule',
        'Fach',
        'Prüfung',
        'Datum',
        'Beschreibung',
        'Gewichtung',
        'Abgeschlossen',
        'Note',
        'Gewichtung Note',
        'Kommentar',
      ],
      ...schools.flatMap((school) =>
        school.subjects.flatMap((subject) =>
          subject.exams.map((exam) => [
            school.name,
            subject.name,
            exam.name,
            exam.date.toISOString().split('T')[0],
            exam.description || '',
            exam.weight || 1,
            exam.isCompleted ? 'Ja' : 'Nein',
            exam.grade?.score || '',
            exam.grade?.weight || '',
            exam.grade?.comment || '',
          ]),
        ),
      ),
    ];
    const allExamsSheet = XLSX.utils.aoa_to_sheet(allExamsData);
    XLSX.utils.book_append_sheet(workbook, allExamsSheet, 'Alle Prüfungen');
    schools.forEach((school) => {
      const schoolSummary = this.calculateSummaries([school]);
      const schoolData = [
        [`${school.name} - Detailansicht`],
        [''],
        ['Schulinformationen'],
        ['Name', school.name],
        ['Adresse', school.address || ''],
        ['Typ', school.type || ''],
        [''],
        ['Zusammenfassung'],
        ['Gesamtdurchschnitt', schoolSummary.overallAverage.toFixed(2)],
        ['Abgeschlossene Prüfungen', schoolSummary.examsCompleted.toString()],
        ['Gesamte Prüfungen', schoolSummary.examsTotal.toString()],
        [''],
        ['Fach', 'Durchschnitt'],
        ...Object.entries(schoolSummary.perSubjectAverages).map(
          ([subject, average]) => [subject, average.toFixed(2)],
        ),
      ];

      const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
      const sheetName = school.name.substring(0, 25).replace(/[[\]\\/?*]/g, '');
      XLSX.utils.book_append_sheet(workbook, schoolSheet, sheetName);
    });

    const totalSummary = this.calculateSummaries(schools);
    const summaryData = [
      ['NetGrade Gesamtzusammenfassung'],
      [''],
      ['Gesamtstatistiken'],
      ['Anzahl Schulen', schools.length.toString()],
      ['Gesamtdurchschnitt', totalSummary.overallAverage.toFixed(2)],
      ['Abgeschlossene Prüfungen', totalSummary.examsCompleted.toString()],
      ['Gesamte Prüfungen', totalSummary.examsTotal.toString()],
      [''],
      ['Durchschnitt pro Schule'],
      ...schools.map((school) => {
        const schoolSummary = this.calculateSummaries([school]);
        return [school.name, schoolSummary.overallAverage.toFixed(2)];
      }),
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Zusammenfassung');

    return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  }

  /**
   * Format single school as XLSX (behält die alte Struktur bei)
   */
  private static formatSingleSchoolAsXlsx(school: School): string {
    const workbook = XLSX.utils.book_new();

    const schoolData = [
      ['School Information'],
      ['Name', school.name],
      ['Address', school.address || ''],
      ['Type', school.type || ''],
    ];
    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'School');

    const subjectsData = [
      ['Name', 'Teacher', 'Description', 'Weight', 'Created at'],
      ...school.subjects.map((subject) => [
        subject.name,
        subject.teacher || '',
        subject.description || '',
        subject.weight || 1,
        subject.createdAt.toLocaleDateString('de-DE'),
      ]),
    ];
    const subjectsSheet = XLSX.utils.aoa_to_sheet(subjectsData);
    XLSX.utils.book_append_sheet(workbook, subjectsSheet, 'Subjects');

    const examsData = [
      [
        'Subject',
        'Name',
        'Date',
        'Description',
        'Weight',
        'Completed',
        'Score',
        'Comment',
      ],
      ...school.subjects.flatMap((subject) =>
        subject.exams.map((exam) => [
          subject.name,
          exam.name,
          exam.date.toISOString().split('T')[0],
          exam.description || '',
          exam.weight || 1,
          exam.isCompleted ? 'Yes' : 'No',
          exam.grade?.score || '',
          exam.grade?.comment || '',
        ]),
      ),
    ];
    const examsSheet = XLSX.utils.aoa_to_sheet(examsData);
    XLSX.utils.book_append_sheet(workbook, examsSheet, 'Exams');

    const summaries = this.calculateSummaries([school]);
    const summariesData = [
      ['Summaries'],
      [''],
      ['Subject', 'Average'],
      ...Object.entries(summaries.perSubjectAverages).map(
        ([subject, average]) => [subject, average.toFixed(2)],
      ),
      [''],
      ['Overall Average', summaries.overallAverage.toFixed(2)],
      ['Exams Completed', summaries.examsCompleted],
      ['Total Exams', summaries.examsTotal],
    ];
    const summariesSheet = XLSX.utils.aoa_to_sheet(summariesData);
    XLSX.utils.book_append_sheet(workbook, summariesSheet, 'Summaries');

    return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  }

  /**
   * Calculate summary statistics for one or multiple schools
   */
  private static calculateSummaries(schools: School[]) {
    const perSubjectAverages: Record<string, number> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let examsCompleted = 0;
    let examsTotal = 0;

    schools.forEach((school) => {
      school.subjects.forEach((subject) => {
        const completedExams = subject.exams.filter(
          (exam) => exam.isCompleted && exam.grade,
        );
        examsTotal += subject.exams.length;
        examsCompleted += completedExams.length;

        if (completedExams.length > 0) {
          const subjectScore =
            completedExams.reduce(
              (sum, exam) => sum + exam.grade!.score * (exam.weight || 1),
              0,
            ) /
            completedExams.reduce((sum, exam) => sum + (exam.weight || 1), 0);

          const subjectKey =
            schools.length > 1
              ? `${school.name} - ${subject.name}`
              : subject.name;
          perSubjectAverages[subjectKey] = subjectScore;
          totalWeightedScore += subjectScore * (subject.weight || 1);
          totalWeight += subject.weight || 1;
        }
      });
    });

    return {
      perSubjectAverages,
      overallAverage: totalWeight > 0 ? totalWeightedScore / totalWeight : 0,
      examsCompleted,
      examsTotal,
    };
  }
}
