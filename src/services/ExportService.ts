import { getRepositories } from '@/db/data-source';
import { School, Subject, Exam, Grade } from '@/db/entities';
import * as XLSX from 'xlsx';

export type ExportFormat = 'json' | 'csv' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  includeSchools?: boolean;
  includeSubjects?: boolean;
  includeExams?: boolean;
  includeGrades?: boolean;
}

export class ExportService {
  /**
   * Exports data based on the specified options
   * @param options - Export configuration options
   * @returns Promise<Blob> - The exported data as a Blob
   */
  static async exportData(options: ExportOptions): Promise<Blob> {
    try {
      const data: Record<string, any> = {};
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
          return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        case 'csv':
          return await this.exportToCSV(data);
        case 'xlsx':
          return await this.exportToXLSX(data);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Converts the data object to CSV format
   * @param data - The data to convert
   * @returns Promise<Blob> - The CSV formatted data as a Blob
   */
  private static async exportToCSV(data: Record<string, any>): Promise<Blob> {
    const worksheet = XLSX.utils.json_to_sheet(this.flattenData(data));
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  private static async exportToXLSX(data: Record<string, any>): Promise<Blob> {
    const worksheet = XLSX.utils.json_to_sheet(this.flattenData(data));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
    const xlsxBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  private static flattenData(data: Record<string, any>): any[] {
    const rows: any[] = [];
    for (const [dataType, items] of Object.entries(data)) {
      if (!Array.isArray(items) || items.length === 0) continue;
      rows.push(...items.map(item => ({ type: dataType, ...item })));
    }
    return rows;
  }
}
