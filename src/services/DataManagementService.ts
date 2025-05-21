import { getDataSource, getRepositories } from '@/db/data-source';
import { School, Subject, Exam, Grade } from '@/db/entities';
import * as XLSX from 'xlsx';

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
   * Exports school data in the specified format (XLSX, CSV, or JSON).
   * @param school - The school data to export
   * @param options - Export configuration options including format and filename
   * @returns A Blob containing the exported data
   * @throws {Error} If the export operation fails or if an unsupported format is specified
   */
  static async exportData(
    school: School,
    options: ExportOptions,
  ): Promise<Blob> {
    const exportData = this.prepareExportData(school);

    switch (options.format) {
      case 'xlsx':
        return this.exportToXLSX(exportData);
      case 'csv':
        return this.exportToCSV(exportData);
      case 'json':
        return new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static escapeCSVValue(value: string | object): string {
    if (value === null || value === undefined) {
      return '""';
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  private static convertToCSV(data: Record<string, object[]>): string {
    const sections: string[] = [];
    for (const [dataType, items] of Object.entries(data)) {
      if (!Array.isArray(items) || items.length === 0) continue;
      const sectionRows: string[] = [
        dataType.toUpperCase(),
        Object.keys(items[0]).join(','),
      ];
      for (const item of items) {
        const row = Object.values(item).map(this.escapeCSVValue);
        sectionRows.push(row.join(','));
      }
      sections.push(sectionRows.join('\n'));
    }
    return sections.join('\n\n');
  }

  private static calculateSubjectAverage(subject: Subject): number {
    const grades = subject.exams
      .filter((exam) => exam.grade)
      .map((exam) => exam.grade!);

    if (grades.length === 0) return 0;

    const weightedSum = grades.reduce(
      (sum, grade) => sum + grade.score * (grade.weight || 1),
      0,
    );
    const weightSum = grades.reduce(
      (sum, grade) => sum + (grade.weight || 1),
      0,
    );

    return weightSum > 0 ? weightedSum / weightSum : 0;
  }

  private static calculateOverallAverage(subjects: Subject[]): number {
    const subjectAverages = subjects.map((subject) => ({
      average: this.calculateSubjectAverage(subject),
      weight: subject.weight || 1,
    }));

    const weightedSum = subjectAverages.reduce(
      (sum, { average, weight }) => sum + average * weight,
      0,
    );
    const weightSum = subjectAverages.reduce(
      (sum, { weight }) => sum + weight,
      0,
    );

    return weightSum > 0 ? weightedSum / weightSum : 0;
  }

  private static generateSummaries(school: School): ExportSummary {
    const subjects = school.subjects;
    const perSubjectAverages = subjects.reduce(
      (acc, subject) => ({
        ...acc,
        [subject.name]: this.calculateSubjectAverage(subject),
      }),
      {} as Record<string, number>,
    );

    const examsTotal = subjects.reduce(
      (sum, subject) => sum + subject.exams.length,
      0,
    );
    const examsCompleted = subjects.reduce(
      (sum, subject) =>
        sum + subject.exams.filter((exam) => exam.isCompleted).length,
      0,
    );

    return {
      perSubjectAverages,
      overallAverage: this.calculateOverallAverage(subjects),
      examsCompleted,
      examsTotal,
    };
  }

  /**
   * Prepares school data for export following a defined schema
   * @param school - The school data to prepare for export
   * @returns ExportData - The prepared data following the export schema
   */
  private static prepareExportData(school: School): ExportData {
    if (!school) {
      throw new Error('School data is required for export');
    }

    if (!school.subjects) {
      school.subjects = [];
    }

    const subjects = school.subjects.map((subject) => ({
      name: subject.name || 'Unnamed Subject',
      teacher: subject.teacher || '',
      description: subject.description || '',
      weight: subject.weight || 1,
      exams: (subject.exams || []).map((exam) => {
        console.log('Exam data:', {
          examId: exam.id,
          examName: exam.name,
          hasGrade: !!exam.grade,
          gradeData: exam.grade,
        });

        return {
          name: exam.name || 'Unnamed Exam',
          date: exam.date || new Date(),
          description: exam.description || '',
          weight: exam.weight || 1,
          isCompleted: exam.isCompleted || false,
          grade: exam.grade
            ? {
                score: exam.grade.score || 0,
                weight: exam.grade.weight || 1,
                comment: exam.grade.comment || '',
                date: exam.grade.date || new Date(),
              }
            : null,
        };
      }),
    }));

    const perSubjectAverages = subjects.reduce(
      (acc, subject) => ({
        ...acc,
        [subject.name]: this.calculateSubjectAverage(subject),
      }),
      {} as Record<string, number>,
    );

    const examsTotal = subjects.reduce(
      (sum, subject) => sum + subject.exams.length,
      0,
    );

    const examsCompleted = subjects.reduce(
      (sum, subject) =>
        sum + subject.exams.filter((exam) => exam.isCompleted).length,
      0,
    );

    return {
      school: {
        name: school.name || 'Unnamed School',
        address: school.address || '',
      },
      subjects,
      summaries: {
        perSubjectAverages,
        overallAverage: this.calculateOverallAverage(subjects),
        examsCompleted,
        examsTotal,
      },
    };
  }

  private static exportToXLSX(data: ExportData): Blob {
    const workbook = XLSX.utils.book_new();

    const schoolData = [
      ['School Information'],
      ['Name', data.school.name],
      ['Address', data.school.address || ''],
    ];
    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'School Info');

    const subjectsData = [
      [
        'Subject',
        'Teacher',
        'Description',
        'Weight',
        'Exam',
        'Date',
        'Description',
        'Weight',
        'Completed',
        'Grade',
        'Grade Weight',
        'Comment',
        'Grade Date',
      ],
    ];

    data.subjects.forEach((subject) => {
      subject.exams.forEach((exam, index) => {
        subjectsData.push([
          index === 0 ? subject.name : '',
          index === 0 ? subject.teacher : '',
          index === 0 ? subject.description || '' : '',
          index === 0 ? String(subject.weight) : '',
          exam.name,
          exam.date.toISOString().split('T')[0],
          exam.description || '',
          String(exam.weight),
          exam.isCompleted ? 'Yes' : 'No',
          exam.grade ? String(exam.grade.score) : '',
          exam.grade ? String(exam.grade.weight) : '',
          exam.grade?.comment || '',
          exam.grade?.date.toISOString().split('T')[0] || '',
        ]);
      });
    });

    const subjectsSheet = XLSX.utils.aoa_to_sheet(subjectsData);
    XLSX.utils.book_append_sheet(workbook, subjectsSheet, 'Subjects & Exams');

    const summaryData = [
      ['Summary Information'],
      ['Overall Average', String(data.summaries.overallAverage)],
      ['Exams Completed', String(data.summaries.examsCompleted)],
      ['Total Exams', String(data.summaries.examsTotal)],
      [''],
      ['Subject Averages'],
      ['Subject', 'Average'],
    ];

    Object.entries(data.summaries.perSubjectAverages).forEach(
      ([subject, average]) => {
        summaryData.push([subject, String(average)]);
      },
    );

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private static exportToCSV(data: ExportData): Blob {
    const rows = [
      ['School Information'],
      ['Name', data.school.name],
      ['Address', data.school.address || ''],
      [''],

      [
        'Subject',
        'Teacher',
        'Description',
        'Weight',
        'Exam',
        'Date',
        'Description',
        'Weight',
        'Completed',
        'Grade',
        'Grade Weight',
        'Comment',
        'Grade Date',
      ],
    ];

    data.subjects.forEach((subject) => {
      subject.exams.forEach((exam, index) => {
        rows.push([
          index === 0 ? subject.name : '',
          index === 0 ? subject.teacher : '',
          index === 0 ? subject.description || '' : '',
          index === 0 ? String(subject.weight) : '',
          exam.name,
          exam.date.toISOString().split('T')[0],
          exam.description || '',
          String(exam.weight),
          exam.isCompleted ? 'Yes' : 'No',
          exam.grade ? String(exam.grade.score) : '',
          exam.grade ? String(exam.grade.weight) : '',
          exam.grade?.comment || '',
          exam.grade?.date.toISOString().split('T')[0] || '',
        ]);
      });
    });

    rows.push(
      [''],
      ['Summary Information'],
      ['Overall Average', String(data.summaries.overallAverage)],
      ['Exams Completed', String(data.summaries.examsCompleted)],
      ['Total Exams', String(data.summaries.examsTotal)],
      [''],
      ['Subject Averages'],
      ['Subject', 'Average'],
    );

    Object.entries(data.summaries.perSubjectAverages).forEach(
      ([subject, average]) => {
        rows.push([subject, String(average)]);
      },
    );

    const csvContent = rows
      .map((row) =>
        row.map((cell) => (cell.includes(',') ? `"${cell}"` : cell)).join(','),
      )
      .join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}
