import { getDataSource, getRepositories } from '@/db/data-source';

export type ExportFormat = 'json' | 'csv';

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
      const data: Record<string, object[]> = {};
      const { school, subject, exam, grade } = getRepositories();

      if (options.includeSchools) {
        data.schools = await school.find();
      }

      if (options.includeSubjects) {
        data.subjects = await subject.find({
          relations: ['school'],
        });
      }

      if (options.includeExams) {
        data.exams = await exam.find({
          relations: ['subject'],
        });
      }

      if (options.includeGrades) {
        data.grades = await grade.find({
          relations: ['exam'],
        });
      }

      switch (options.format) {
        case 'json':
          return JSON.stringify(data, null, 2);
        case 'csv':
          return this.convertToCSV(data);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
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
