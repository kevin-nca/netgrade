import { getDataSource, getRepositories } from '@/db/data-source';
import * as XLSX from 'xlsx';

export type ExportFormat = 'json' | 'csv' | 'xlsx';

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
  static async exportData(options: ExportOptions): Promise<string> {
    try {
      const data: Record<string, object> = {};
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

      switch (options.format) {
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

          if (options.format === 'csv') {
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
          throw new Error(`Unsupported export format: ${options.format}`);
      }
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
}
