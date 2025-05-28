import { PreferencesService } from './PreferencesService';
import { getDataSource } from '@/db/data-source';
import { School } from '@/db/entities';
import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Represents a grade in the export data
 */
export interface ExportGrade {
  score: number;
  weight: number;
  comment: string;
  date: Date;
}

/**
 * Represents an exam in the export data
 */
export interface ExportExam {
  name: string;
  date: Date;
  description: string;
  weight: number;
  isCompleted: boolean;
  grade: ExportGrade | null;
}

/**
 * Represents a subject in the export data
 */
export interface ExportSubject {
  name: string;
  teacher: string;
  description: string;
  weight: number;
  exams: ExportExam[];
}

/**
 * Represents a school in the export data
 */
export interface ExportSchool {
  name: string;
  address: string;
}

/**
 * Represents summary statistics in the export data
 */
export interface ExportSummary {
  perSubjectAverages: Record<string, number>;
  overallAverage: number;
  examsCompleted: number;
  examsTotal: number;
}

/**
 * The complete export data structure
 */
export interface ExportData {
  school: ExportSchool;
  subjects: ExportSubject[];
  summaries: ExportSummary;
}

/**
 * Supported export formats
 */
export type ExportFormat = 'json' | 'csv' | 'xlsx';

/**
 * Options for configuring the export
 */
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeSchools: boolean;
  includeSubjects: boolean;
  includeExams: boolean;
  includeGrades: boolean;
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

      console.log('All data reset successfully');
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }

  /**
   * Exports school data in the specified format
   * @param school - The school to export
   * @param options - Export options including format and content filters
   * * @returns Promise<Blob> - The exported file as a blob
   */
  static async exportData(
    school: School,
    options: ExportOptions,
  ): Promise<Blob> {
    try {
      const exportData = this.prepareExportData(school);
      const data = this.filterExportData(exportData);
      const content = this.formatData(data, options.format);
      if (options.format === 'xlsx') {
        const base64Data = content;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } else {
        return new Blob([content], {
          type: options.format === 'json' ? 'application/json' : 'text/csv',
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Prepares the data for export by transforming the school entity into the export format
   * @param school - The school to prepare data for
   * @returns ExportData - The prepared export data
   */
  private static prepareExportData(school: School): ExportData {
    const subjects = school.subjects.map((subject) => ({
      name: subject.name,
      teacher: subject.teacher,
      description: subject.description,
      weight: subject.weight,
      exams: (subject.exams || []).map((exam) => ({
        name: exam.name,
        date: exam.date,
        description: exam.description,
        weight: exam.weight,
        isCompleted: exam.isCompleted,
        grade: exam.grade
          ? {
              score: exam.grade.score,
              weight: exam.grade.weight,
              comment: exam.grade.comment || '',
              date: exam.grade.date,
            }
          : null,
      })),
    }));

    const examsTotal = subjects.reduce(
      (sum, subject) => sum + subject.exams.length,
      0,
    );
    const examsCompleted = subjects.reduce(
      (sum, subject) =>
        sum + subject.exams.filter((exam) => exam.isCompleted).length,
      0,
    );

    const perSubjectAverages: Record<string, number> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    subjects.forEach((subject) => {
      const subjectExams = subject.exams.filter(
        (exam) => exam.isCompleted && exam.grade,
      );
      if (subjectExams.length > 0) {
        const subjectScore =
          subjectExams.reduce(
            (sum, exam) => sum + (exam.grade?.score || 0) * (exam.weight || 1),
            0,
          ) / subjectExams.reduce((sum, exam) => sum + (exam.weight || 1), 0);
        perSubjectAverages[subject.name] = subjectScore;
        totalWeightedScore += subjectScore * (subject.weight || 1);
        totalWeight += subject.weight || 1;
      }
    });

    return {
      school: {
        name: school.name,
        address: school.address || '',
      },
      subjects: subjects.map((subject) => ({
        name: subject.name,
        teacher: subject.teacher || '',
        description: subject.description || '',
        weight: subject.weight || 1,
        exams: subject.exams.map((exam) => ({
          name: exam.name,
          date: exam.date,
          description: exam.description || '',
          weight: exam.weight || 1,
          isCompleted: exam.isCompleted,
          grade: exam.grade
            ? {
                score: exam.grade.score,
                weight: exam.grade.weight,
                comment: exam.grade.comment || '',
                date: exam.grade.date,
              }
            : null,
        })),
      })),
      summaries: {
        perSubjectAverages,
        overallAverage: totalWeight > 0 ? totalWeightedScore / totalWeight : 0,
        examsCompleted,
        examsTotal,
      },
    };
  }

  /**
   * Filters the export data based on the provided options
   * @param data - The data to filter
   * @returns ExportData - The filtered data
   */
  private static filterExportData(data: ExportData): ExportData {
    return data;
  }

  /**
   * Formats the data according to the specified format
   * @param data - The data to format
   * @param exportFormat - The desired format
   * @returns string - The formatted data
   */
  private static formatData(
    data: ExportData,
    exportFormat: ExportFormat,
  ): string {
    const workbook = XLSX.utils.book_new();

    const schoolData = [
      ['School Information'],
      ['Name', data.school.name],
      ['Address', data.school.address],
    ];
    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'School');

    const subjectsData = [
      ['Name', 'Teacher', 'Description', 'Weight'],
      ...data.subjects.map((subject) => [
        subject.name,
        subject.teacher,
        subject.description,
        subject.weight,
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
      ...data.subjects.flatMap((subject) =>
        subject.exams.map((exam) => [
          subject.name,
          exam.name,
          exam.date,
          exam.description,
          exam.weight,
          exam.isCompleted,
          exam.grade?.score || '',
          exam.grade?.comment || '',
        ]),
      ),
    ];
    const examsSheet = XLSX.utils.aoa_to_sheet(examsData);
    XLSX.utils.book_append_sheet(workbook, examsSheet, 'Exams');

    const summariesData = [
      ['Summaries'],
      ['Subject', 'Average'],
      ...Object.entries(data.summaries.perSubjectAverages).map(
        ([subject, average]) => [subject, average],
      ),
      ['Overall Average', data.summaries.overallAverage],
      ['Exams Completed', data.summaries.examsCompleted],
      ['Total Exams', data.summaries.examsTotal],
    ];
    const summariesSheet = XLSX.utils.aoa_to_sheet(summariesData);
    XLSX.utils.book_append_sheet(workbook, summariesSheet, 'Summaries');

    switch (exportFormat) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return (
          XLSX.utils.sheet_to_csv(schoolSheet) +
          '\n\n' +
          XLSX.utils.sheet_to_csv(subjectsSheet) +
          '\n\n' +
          XLSX.utils.sheet_to_csv(examsSheet) +
          '\n\n' +
          XLSX.utils.sheet_to_csv(summariesSheet)
        );
      case 'xlsx':
        return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      default:
        throw new Error(`Unsupported format: ${exportFormat}`);
    }
  }

  /**
   * Generates a filename for the export
   * @param schoolName - The name of the school
   * @param exportFormat - The desired format
   * @returns string - The generated filename
   */
  private static generateFilename(
    schoolName: string,
    exportFormat: ExportFormat,
  ): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${sanitizedName}_export_${timestamp}.${exportFormat}`;
  }

  /**
   * Saves the file to the filesystem
   * @param content - The file content
   * @param filename - The name of the file
   * @returns Promise<string> - The path to the saved file
   */
  private static async saveFile(
    content: string,
    filename: string,
  ): Promise<string> {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Documents,
        recursive: true,
      });
      return result.uri;
    } catch (error) {
      console.error('Failed to save file:', error);
      throw error;
    }
  }
}
