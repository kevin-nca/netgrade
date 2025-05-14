import { getDataSource, getRepositories } from '@/db/data-source';
import { School, Subject, Exam, Grade } from '@/db/entities';
import * as XLSX from 'xlsx';
import { ExportData, ExportOptions, ExportSummary } from '@/types/export';

export type ExportFormat = 'json' | 'csv' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  includeSchools?: boolean;
  includeSubjects?: boolean;
  includeExams?: boolean;
  includeGrades?: boolean;
}

export interface ExportData {
  schools?: School[];
  subjects?: Subject[];
  exams?: Exam[];
  grades?: Grade[];
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

  static async collectExportData(options: ExportOptions): Promise<ExportData> {
    const data: ExportData = {};
    const repositories = getRepositories();

    if (options.includeSchools) {
      data.schools = await repositories.school.find();
    }
    if (options.includeSubjects) {
      data.subjects = await repositories.subject.find();
    }
    if (options.includeExams) {
      data.exams = await repositories.exam.find();
    }
    if (options.includeGrades) {
      data.grades = await repositories.grade.find();
    }

    return data;
  }

  static serializeExportData(data: ExportData, format: ExportFormat): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
      case 'xlsx': {
        const workbook = XLSX.utils.book_new();

        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(value);
            XLSX.utils.book_append_sheet(workbook, worksheet, key);
          }
        });

        if (format === 'csv') {
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          return XLSX.utils.sheet_to_csv(firstSheet);
        } else {
          const wbout = XLSX.write(workbook, {
            type: 'base64',
            bookType: 'xlsx',
          });
          return wbout;
        }
      }
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  static async exportData(options: ExportOptions): Promise<string> {
    try {
      const data = await this.collectExportData(options);
      return this.serializeExportData(data, options.format);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
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

  private calculateSubjectAverage(subject: Subject): number {
    const grades = subject.exams
      .filter((exam) => exam.grade)
      .map((exam) => exam.grade!);

    if (grades.length === 0) return 0;

    const weightedSum = grades.reduce(
      (sum, grade) => sum + grade.score * grade.weight,
      0,
    );
    const weightSum = grades.reduce((sum, grade) => sum + grade.weight, 0);

    return weightSum > 0 ? weightedSum / weightSum : 0;
  }

  private calculateOverallAverage(subjects: Subject[]): number {
    const subjectAverages = subjects.map((subject) => ({
      average: this.calculateSubjectAverage(subject),
      weight: subject.weight,
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

  private generateSummaries(school: School): ExportSummary {
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

  private prepareExportData(school: School): ExportData {
    return {
      school: {
        name: school.name,
        address: school.address,
      },
      subjects: school.subjects.map((subject) => ({
        name: subject.name,
        teacher: subject.teacher,
        description: subject.description,
        weight: subject.weight,
        exams: subject.exams.map((exam) => ({
          name: exam.name,
          date: exam.date,
          description: exam.description,
          weight: exam.weight,
          isCompleted: exam.isCompleted,
          grade: exam.grade
            ? {
                score: exam.grade.score,
                weight: exam.grade.weight,
                comment: exam.grade.comment,
                date: exam.grade.date,
              }
            : null,
        })),
      })),
      summaries: this.generateSummaries(school),
    };
  }

  private exportToXLSX(data: ExportData): Blob {
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
          index === 0 ? subject.weight : '',
          exam.name,
          exam.date.toISOString().split('T')[0],
          exam.description || '',
          exam.weight,
          exam.isCompleted ? 'Yes' : 'No',
          exam.grade?.score || '',
          exam.grade?.weight || '',
          exam.grade?.comment || '',
          exam.grade?.date.toISOString().split('T')[0] || '',
        ]);
      });
    });

    const subjectsSheet = XLSX.utils.aoa_to_sheet(subjectsData);
    XLSX.utils.book_append_sheet(workbook, subjectsSheet, 'Subjects & Exams');

    const summaryData = [
      ['Summary Information'],
      ['Overall Average', data.summaries.overallAverage],
      ['Exams Completed', data.summaries.examsCompleted],
      ['Total Exams', data.summaries.examsTotal],
      [''],
      ['Subject Averages'],
      ['Subject', 'Average'],
    ];

    Object.entries(data.summaries.perSubjectAverages).forEach(
      ([subject, average]) => {
        summaryData.push([subject, average]);
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

  private exportToCSV(data: ExportData): Blob {
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
          index === 0 ? subject.weight : '',
          exam.name,
          exam.date.toISOString().split('T')[0],
          exam.description || '',
          exam.weight,
          exam.isCompleted ? 'Yes' : 'No',
          exam.grade?.score || '',
          exam.grade?.weight || '',
          exam.grade?.comment || '',
          exam.grade?.date.toISOString().split('T')[0] || '',
        ]);
      });
    });

    rows.push(
      [''],
      ['Summary Information'],
      ['Overall Average', data.summaries.overallAverage],
      ['Exams Completed', data.summaries.examsCompleted],
      ['Total Exams', data.summaries.examsTotal],
      [''],
      ['Subject Averages'],
      ['Subject', 'Average'],
    );

    Object.entries(data.summaries.perSubjectAverages).forEach(
      ([subject, average]) => {
        rows.push([subject, average]);
      },
    );

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) =>
            typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell,
          )
          .join(','),
      )
      .join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async exportData(school: School, options: ExportOptions): Promise<Blob> {
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
}
