import { PreferencesService } from './PreferencesService';
import { getDataSource } from '@/db/data-source';
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
  filename?: string;
  schoolId: string;
}

interface DbSchool {
  id: string;
  name: string;
  address: string | null;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  appInstanceId: string;
}

interface DbSubject {
  id: string;
  name: string;
  teacher: string | null;
  description: string | null;
  weight: number | null;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  appInstanceId: string;
}

interface DbExam {
  id: string;
  name: string;
  date: Date | string;
  description: string | null;
  weight: number | null;
  isCompleted: boolean;
  subjectId: string;
  gradeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  appInstanceId: string;
}

interface DbGrade {
  id: string;
  score: number;
  weight: number;
  comment: string | null;
  date: Date | string;
  examId?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  appInstanceId: string;
}

interface ProcessedExam extends Omit<DbExam, 'date'> {
  date: Date;
  grade: (Omit<DbGrade, 'date'> & { date: Date }) | null;
  hasGrade: boolean;
}

interface SubjectWithExams extends DbSubject {
  exams: ProcessedExam[];
}

interface SchoolWithSubjects extends DbSchool {
  subjects: SubjectWithExams[];
}

type ExcelRowData = (string | number | boolean)[];

export class DataManagementService {
  /**
   * Converts a string or Date to a Date object
   */
  private static ensureDate(date: string | Date): Date {
    return typeof date === 'string' ? new Date(date) : date;
  }

  /**
   * Normalizes a string for comparison by removing extra whitespace and converting to lowercase
   */
  private static normalizeString(str: string): string {
    return (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * Normalizes a date to YYYY-MM-DD format for comparison
   */
  private static normalizeDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD only
  }

  /**
   * Creates a unique key for exam identification
   */
  private static createExamKey(exam: DbExam): string {
    const normalizedName = this.normalizeString(exam.name);
    const normalizedDate = this.normalizeDate(exam.date);
    const normalizedDescription = this.normalizeString(exam.description || '');
    return `${exam.subjectId}|${normalizedName}|${normalizedDate}|${normalizedDescription}`;
  }

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
   * @param options - Export options including format and schoolId
   * @returns Promise<Blob> - The exported file as a blob
   */
  static async exportData(options: ExportOptions): Promise<Blob> {
    try {
      const dataSource = getDataSource();

      console.log('=== ROBUST DUPLICATE REMOVAL ===');
      console.log('School ID:', options.schoolId);

      const schools = (await dataSource.query(
        'SELECT * FROM school WHERE id = ?',
        [options.schoolId],
      )) as DbSchool[];
      if (!schools || schools.length === 0) {
        throw new Error('School not found');
      }
      const targetSchool = schools[0];

      const subjects = (await dataSource.query(
        'SELECT * FROM subject WHERE schoolId = ?',
        [options.schoolId],
      )) as DbSubject[];
      const subjectIds = subjects.map((s) => s.id);
      let exams: DbExam[] = [];

      if (subjectIds.length > 0) {
        const placeholders = subjectIds.map(() => '?').join(',');
        exams = (await dataSource.query(
          `SELECT * FROM exam WHERE subjectId IN (${placeholders})`,
          subjectIds,
        )) as DbExam[];
      }

      const grades = (await dataSource.query(
        'SELECT * FROM grade',
      )) as DbGrade[];

      console.log(`Raw data: ${exams.length} exams, ${grades.length} grades`);

      const examsWithGrades: ProcessedExam[] = exams.map((exam) => {
        let grade: DbGrade | null = null;

        if (exam.gradeId) {
          grade = grades.find((g) => g.id === exam.gradeId) || null;
        }

        if (!grade) {
          grade = grades.find((g) => g.examId === exam.id) || null;
        }

        return {
          ...exam,
          date: this.ensureDate(exam.date),
          grade: grade
            ? {
                ...grade,
                date: this.ensureDate(grade.date),
              }
            : null,
          hasGrade: !!grade,
        };
      });

      const examGroups = new Map<string, ProcessedExam[]>();
      examsWithGrades.forEach((exam) => {
        const key = this.createExamKey(exam);

        if (!examGroups.has(key)) {
          examGroups.set(key, []);
        }
        examGroups.get(key)!.push(exam);
      });

      console.log(
        `Grouping result: ${examGroups.size} unique groups from ${examsWithGrades.length} exams`,
      );

      const finalExams: ProcessedExam[] = [];

      examGroups.forEach((duplicates, groupKey) => {
        if (duplicates.length === 1) {
          finalExams.push(duplicates[0]);
        } else {
          console.log(
            `Resolving ${duplicates.length} duplicates for: ${groupKey}`,
          );

          const bestExam = duplicates.reduce((best, current) => {
            let bestScore = 0;
            let currentScore = 0;

            if (best.hasGrade) bestScore += 100;
            if (current.hasGrade) currentScore += 100;

            if (best.isCompleted) bestScore += 50;
            if (current.isCompleted) currentScore += 50;

            bestScore += parseInt(best.id.replace(/\D/g, '')) / 1000;
            currentScore += parseInt(current.id.replace(/\D/g, '')) / 1000;

            if (best.description && best.description.trim()) bestScore += 5;
            if (current.description && current.description.trim())
              currentScore += 5;

            return currentScore > bestScore ? current : best;
          });

          finalExams.push(bestExam);
          console.log(
            `Chosen exam ID: ${bestExam.id} with grade: ${bestExam.grade?.score || 'none'}`,
          );
        }
      });

      console.log(`Final result: ${finalExams.length} unique exams`);

      const subjectsWithExams: SubjectWithExams[] = subjects.map((subject) => {
        const subjectExams = finalExams.filter(
          (exam) => exam.subjectId === subject.id,
        );

        return {
          ...subject,
          exams: subjectExams,
        };
      });

      const schoolWithSubjects: SchoolWithSubjects = {
        ...targetSchool,
        subjects: subjectsWithExams,
      };

      const exportData = this.prepareExportData(schoolWithSubjects);
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
  private static prepareExportData(school: SchoolWithSubjects): ExportData {
    const subjects: ExportSubject[] = school.subjects.map((subject) => {
      const exams: ExportExam[] = subject.exams.map((exam) => {
        let gradeData: ExportGrade | null = null;
        if (
          exam.grade &&
          exam.grade.score !== null &&
          exam.grade.score !== undefined
        ) {
          gradeData = {
            score: exam.grade.score,
            weight: exam.grade.weight,
            comment: exam.grade.comment || '',
            date: exam.grade.date,
          };
        }

        return {
          name: exam.name,
          date: exam.date,
          description: exam.description || '',
          weight: exam.weight || 1,
          isCompleted: exam.isCompleted,
          grade: gradeData,
        };
      });

      return {
        name: subject.name,
        teacher: subject.teacher || '',
        description: subject.description || '',
        weight: subject.weight || 1,
        exams: exams,
      };
    });

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
      subjects: subjects,
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

    const schoolData: ExcelRowData[] = [
      ['School Information'],
      ['Name', data.school.name],
      ['Address', data.school.address],
    ];
    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'School');

    const subjectsData: ExcelRowData[] = [
      ['Name', 'Teacher', 'Description', 'Weight'],
      ...data.subjects.map(
        (subject): ExcelRowData => [
          subject.name,
          subject.teacher,
          subject.description,
          subject.weight,
        ],
      ),
    ];
    const subjectsSheet = XLSX.utils.aoa_to_sheet(subjectsData);
    XLSX.utils.book_append_sheet(workbook, subjectsSheet, 'Subjects');

    console.log('\n=== EXCEL COLUMN MAPPING DEBUG ===');

    const allExamRows: ExcelRowData[] = [];
    const seenExams = new Set<string>();

    data.subjects.forEach((subject) => {
      subject.exams.forEach((exam) => {
        const verificationKey = `${subject.name}|${exam.name}|${this.normalizeDate(exam.date)}`;

        if (seenExams.has(verificationKey)) {
          console.log(`WARNING: Duplicate exam skipped: ${verificationKey}`);
          return;
        }

        seenExams.add(verificationKey);

        const subjectName = subject.name;
        const examName = exam.name;
        const examDate =
          exam.date instanceof Date
            ? exam.date.toLocaleDateString('de-DE')
            : exam.date;
        const examDescription = exam.description || '';
        const examWeight = exam.weight || '';
        const examCompleted = exam.isCompleted ? 'Ja' : 'Nein';
        const gradeScore =
          exam.grade &&
          exam.grade.score !== null &&
          exam.grade.score !== undefined
            ? exam.grade.score
            : '';
        const gradeWeight = exam.grade?.weight || '';
        const gradeComment = exam.grade?.comment || '';

        console.log(`Exam: ${examName}`);
        console.log(`  Subject: "${subjectName}"`);
        console.log(`  Date: "${examDate}"`);
        console.log(`  Description: "${examDescription}"`);
        console.log(`  Exam Weight: "${examWeight}"`);
        console.log(`  Completed: "${examCompleted}"`);
        console.log(`  Grade Score: "${gradeScore}"`);
        console.log(`  Grade Weight: "${gradeWeight}"`);
        console.log(`  Grade Comment: "${gradeComment}"`);

        const rowData: ExcelRowData = [
          subjectName,
          examName,
          examDate,
          examDescription,
          examWeight,
          examCompleted,
          gradeScore,
          gradeWeight,
          gradeComment,
        ];

        console.log(
          `Row Data: [${rowData.map((val) => `"${val}"`).join(', ')}]`,
        );
        allExamRows.push(rowData);
      });
    });

    console.log(`Total Excel rows: ${allExamRows.length}`);

    const examsData: ExcelRowData[] = [
      [
        'Subject',
        'Name',
        'Date',
        'Description',
        'Exam Weight',
        'Completed',
        'Score',
        'Grade Weight',
        'Comment',
      ],
      ...allExamRows,
    ];

    console.log('Final Excel headers:', examsData[0]);
    console.log('Sample data row:', examsData[1] || 'No data rows');

    const examsSheet = XLSX.utils.aoa_to_sheet(examsData);
    XLSX.utils.book_append_sheet(workbook, examsSheet, 'Exams');

    const summariesData: ExcelRowData[] = [
      ['Summaries'],
      ['Subject', 'Average'],
      ...Object.entries(data.summaries.perSubjectAverages).map(
        ([subject, average]): ExcelRowData => [subject, average],
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
}
