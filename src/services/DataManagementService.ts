import { getDataSource, getRepositories } from '@/db/data-source';
import { School, Subject, Exam, Grade } from '@/db/entities';
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
  includeSchools?: boolean;
  includeSubjects?: boolean;
  includeExams?: boolean;
  includeGrades?: boolean;
}

export class DataManagementService {
  static async resetAllData(): Promise<void> {
    try {
      const dataSource = getDataSource();
      await dataSource.transaction(async (transactionManager) => {
        await transactionManager.query('DELETE FROM grade');
        await transactionManager.query('DELETE FROM exam');
        await transactionManager.query('DELETE FROM subject');
        await transactionManager.query('DELETE FROM school');
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }

  /**
   * Exports school data in the specified format
   * @param school - The school to export
   * @param options - Export options including format and content filters
   * @returns Promise<string> - The path to the exported file
   */
  static async exportData(
    school: School,
    options: ExportOptions,
  ): Promise<string> {
    try {
      const exportData = this.prepareExportData(school);
      const data = this.filterExportData(exportData, options);
      const content = this.formatData(data, options.format);
      const filename = this.generateFilename(school.name, options.format);
      const path = await this.saveFile(content, filename, options.format);
      return path;
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
        totalWeight += (subject.weight || 1);
      }
    });

    return {
      school: {
        name: school.name,
        address: school.address || '',
      },
      subjects: subjects.map(subject => ({
        name: subject.name,
        teacher: subject.teacher || '',
        description: subject.description || '',
        weight: subject.weight || 1,
        exams: subject.exams.map(exam => ({
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
   * @param options - The export options
   * @returns ExportData - The filtered data
   */
  private static filterExportData(
    data: ExportData,
    options: ExportOptions,
  ): ExportData {
    const filteredData = { ...data };

    if (!options.includeGrades) {
      filteredData.subjects = filteredData.subjects.map((subject) => ({
        ...subject,
        exams: subject.exams.map((exam) => ({
          ...exam,
          grade: null,
        })),
      }));
    }

    if (!options.includeExams) {
      filteredData.subjects = filteredData.subjects.map((subject) => ({
        ...subject,
        exams: [],
      }));
    }

    if (!options.includeSubjects) {
      filteredData.subjects = [];
    }

    return filteredData;
  }

  /**
   * Formats the data according to the specified format
   * @param data - The data to format
   * @param format - The desired format
   * @returns string - The formatted data
   */
  private static formatData(data: ExportData, format: ExportFormat): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'xlsx':
        return this.convertToXLSX(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Converts the export data to CSV format
   * @param data - The data to convert
   * @returns string - The CSV data
   */
  private static convertToCSV(data: ExportData): string {
    const rows: string[] = [];

    rows.push('School Information');
    rows.push(`Name,${data.school.name}`);
    rows.push(`Address,${data.school.address}`);
    rows.push('');

    rows.push('Subjects');
    rows.push('Name,Teacher,Description,Weight');
    data.subjects.forEach((subject) => {
      rows.push(
        `${subject.name},${subject.teacher},${subject.description},${subject.weight}`,
      );
    });
    rows.push('');

    rows.push('Exams');
    rows.push('Subject,Name,Date,Description,Weight,Completed,Score,Comment');
    data.subjects.forEach((subject) => {
      subject.exams.forEach((exam) => {
        rows.push(
          `${subject.name},${exam.name},${exam.date.toISOString()},${exam.description},${exam.weight},${exam.isCompleted},${exam.grade?.score || ''},${exam.grade?.comment || ''}`,
        );
      });
    });
    rows.push('');

    rows.push('Summaries');
    rows.push('Subject,Average');
    Object.entries(data.summaries.perSubjectAverages).forEach(
      ([subject, average]) => {
        rows.push(`${subject},${average}`);
      },
    );
    rows.push(`Overall Average,${data.summaries.overallAverage}`);
    rows.push(`Exams Completed,${data.summaries.examsCompleted}`);
    rows.push(`Total Exams,${data.summaries.examsTotal}`);

    return rows.join('\n');
  }

  /**
   * Converts the export data to XLSX format
   * @param data - The data to convert
   * @returns string - The XLSX data as base64
   */
  private static convertToXLSX(data: ExportData): string {
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

    return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  }

  /**
   * Generates a filename for the export
   * @param schoolName - The name of the school
   * @param format - The export format
   * @returns string - The generated filename
   */
  private static generateFilename(
    schoolName: string,
    format: ExportFormat,
  ): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${sanitizedName}_export_${timestamp}.${format}`;
  }

  /**
   * Saves the file to the filesystem
   * @param content - The file content
   * @param filename - The name of the file
   * @param format - The file format
   * @returns Promise<string> - The path to the saved file
   */
  private static async saveFile(
    content: string,
    filename: string,
    format: ExportFormat,
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
