import { PreferencesService } from './PreferencesService';
import { getDataSource, getRepositories } from '@/db/data-source';
import { Subject } from '@/db/entities';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  format: 'xlsx';
  filename?: string;
  schoolId: string;
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

  static async exportData(options: ExportOptions): Promise<Blob> {
    try {
      const { school: schoolRepo } = getRepositories();

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
        throw new Error('School not found');
      }

      const workbook = XLSX.utils.book_new();

      const schoolData = [
        ['Schul-Information'],
        ['Name', school.name],
        ['Adresse', school.address || ''],
        ['Typ', school.type || ''],
        ['Erstellt am', school.createdAt.toLocaleDateString('de-DE')],
      ];
      const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
      XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Schule');

      const subjectHeaders = [
        'Name',
        'Lehrer',
        'Beschreibung',
        'Gewichtung',
        'Erstellt am',
      ];
      const subjectRows = school.subjects.map((subject) => [
        subject.name,
        subject.teacher || '',
        subject.description || '',
        subject.weight || 1,
        subject.createdAt.toLocaleDateString('de-DE'),
      ]);
      const subjectData = [subjectHeaders, ...subjectRows];
      const subjectSheet = XLSX.utils.aoa_to_sheet(subjectData);
      XLSX.utils.book_append_sheet(workbook, subjectSheet, 'Fächer');

      const allExams = school.subjects.flatMap((subject) =>
        subject.exams.map((exam) => ({ ...exam, subject })),
      );

      const examHeaders = [
        'Fach',
        'Prüfungsname',
        'Datum',
        'Beschreibung',
        'Gewichtung',
        'Status',
        'Erstellt am',
      ];
      const examRows = allExams.map((exam) => [
        exam.subject.name,
        exam.name,
        exam.date.toLocaleDateString('de-DE'),
        exam.description || '',
        exam.weight || 1,
        exam.isCompleted ? 'Abgeschlossen' : 'Anstehend',
        exam.createdAt.toLocaleDateString('de-DE'),
      ]);
      const examData = [examHeaders, ...examRows];
      const examSheet = XLSX.utils.aoa_to_sheet(examData);
      XLSX.utils.book_append_sheet(workbook, examSheet, 'Alle Prüfungen');

      const allGrades = school.subjects.flatMap((subject) =>
        subject.exams
          .filter((exam) => exam.grade)
          .map((exam) => ({
            ...exam.grade!,
            examName: exam.name,
            examDate: exam.date,
            subject: subject,
          })),
      );

      const gradeHeaders = [
        'Fach',
        'Prüfung',
        'Prüfungsdatum',
        'Note',
        'Gewichtung Note',
        'Kommentar',
        'Notendatum',
        'Erstellt am',
      ];
      const gradeRows = allGrades.map((grade) => [
        grade.subject.name,
        grade.examName,
        grade.examDate.toLocaleDateString('de-DE'),
        grade.score,
        grade.weight,
        grade.comment || '',
        grade.date.toLocaleDateString('de-DE'),
        grade.createdAt.toLocaleDateString('de-DE'),
      ]);
      const gradeData = [gradeHeaders, ...gradeRows];
      const gradeSheet = XLSX.utils.aoa_to_sheet(gradeData);
      XLSX.utils.book_append_sheet(workbook, gradeSheet, 'Noten');

      const stats = this.calculateStatistics(
        school.subjects,
        allExams,
        allGrades,
      );
      const statsData = [
        ['Statistiken'],
        [''],
        ['Anzahl Fächer', school.subjects.length],
        ['Anzahl Prüfungen gesamt', allExams.length],
        [
          'Anzahl abgeschlossene Prüfungen',
          allExams.filter((e) => e.isCompleted).length,
        ],
        [
          'Anzahl anstehende Prüfungen',
          allExams.filter((e) => !e.isCompleted).length,
        ],
        ['Anzahl Noten', allGrades.length],
        [''],
        ['Durchschnitte pro Fach:'],
        ['Fach', 'Durchschnitt', 'Anzahl Noten'],
        ...stats.subjectAverages.map((stat) => [
          stat.subject,
          stat.average.toFixed(2),
          stat.count,
        ]),
        [''],
        [
          'Gesamtdurchschnitt',
          stats.overallAverage > 0
            ? stats.overallAverage.toFixed(2)
            : 'Keine Noten',
        ],
      ];
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiken');

      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Calculate statistics
   */
  private static calculateStatistics(
    subjects: Subject[],
    allExams: Array<{ id: string; subject: Subject; isCompleted: boolean }>,
    allGrades: Array<{ score: number; weight: number; subject: Subject }>,
  ) {
    const subjectAverages = subjects.map((subject) => {
      const subjectGrades = allGrades.filter(
        (grade) => grade.subject.id === subject.id,
      );

      if (subjectGrades.length === 0) {
        return {
          subject: subject.name,
          average: 0,
          count: 0,
        };
      }

      const totalWeightedScore = subjectGrades.reduce(
        (sum: number, grade) => sum + grade.score * grade.weight,
        0,
      );
      const totalWeight = subjectGrades.reduce(
        (sum: number, grade) => sum + grade.weight,
        0,
      );

      return {
        subject: subject.name,
        average: totalWeight > 0 ? totalWeightedScore / totalWeight : 0,
        count: subjectGrades.length,
      };
    });

    const validSubjectAverages = subjectAverages.filter((s) => s.count > 0);
    let overallAverage = 0;

    if (validSubjectAverages.length > 0) {
      const totalWeightedAverage = validSubjectAverages.reduce(
        (sum: number, stat) => {
          const subject = subjects.find((s) => s.name === stat.subject);
          if (!subject) {
            throw new Error(
              `Subject '${stat.subject}' not found in subjects array`,
            );
          }
          const subjectWeight = subject.weight || 1;
          return sum + stat.average * subjectWeight;
        },
        0,
      );

      const totalSubjectWeights = validSubjectAverages.reduce(
        (sum: number, stat) => {
          const subject = subjects.find((s) => s.name === stat.subject);
          if (!subject) {
            throw new Error(
              `Subject '${stat.subject}' not found in subjects array`,
            );
          }
          return sum + (subject.weight || 1);
        },
        0,
      );

      overallAverage =
        totalSubjectWeights > 0
          ? totalWeightedAverage / totalSubjectWeights
          : 0;
    }

    return {
      subjectAverages,
      overallAverage,
    };
  }
}
