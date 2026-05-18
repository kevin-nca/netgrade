import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Exam, Grade, School, Semester, Subject } from '../../db/entities';
import { PDFService } from '../../services';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(false),
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn(),
    getUri: vi.fn(),
  },
  Directory: {
    Data: 'DATA',
  },
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
  },
}));

globalThis.URL.createObjectURL = vi.fn(() => 'blob:mocked-url');
globalThis.URL.revokeObjectURL = vi.fn();

describe('PDFService', () => {
  let dataSource: DataSource;
  let bigSchoolId: string;

  beforeAll(async () => {
    dataSource = await initializeTestDatabase();

    const dataSourceModule = await import('../../db/data-source');
    vi.spyOn(dataSourceModule, 'getDataSource').mockReturnValue(dataSource);
    vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValue({
      school: dataSource.getRepository(School),
      subject: dataSource.getRepository(Subject),
      exam: dataSource.getRepository(Exam),
      grade: dataSource.getRepository(Grade),
      semester: dataSource.getRepository(Semester),
    });

    await seedTestData(dataSource);

    // Build a large school hierarchy to exercise the pagination branches
    const schoolRepo = dataSource.getRepository(School);
    const semesterRepo = dataSource.getRepository(Semester);
    const subjectRepo = dataSource.getRepository(Subject);
    const examRepo = dataSource.getRepository(Exam);
    const gradeRepo = dataSource.getRepository(Grade);

    const bigSchool = await schoolRepo.save(
      schoolRepo.create({ name: 'Big PDF School' }),
    );
    bigSchoolId = bigSchool.id;

    for (let s = 0; s < 2; s++) {
      const semester = await semesterRepo.save(
        semesterRepo.create({
          name: `PDF Semester ${s}`,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30'),
          schoolId: bigSchool.id,
        }),
      );

      for (let sub = 0; sub < 3; sub++) {
        const subject = await subjectRepo.save(
          subjectRepo.create({
            name: `PDF Subject ${s}-${sub}`,
            weight: 1,
            semesterId: semester.id,
          }),
        );

        for (let e = 0; e < 12; e++) {
          const exam = await examRepo.save(
            examRepo.create({
              name: `PDF Exam ${s}-${sub}-${e}`,
              date: new Date('2025-03-15'),
              weight: 2,
              isCompleted: true,
              subjectId: subject.id,
            }),
          );

          // Every other exam gets a grade to cover the grade/no-grade branches
          if (e % 2 === 0) {
            const grade = await gradeRepo.save(
              gradeRepo.create({
                score: 5,
                weight: 1.5,
                date: new Date('2025-03-15'),
              }),
            );
            exam.gradeId = grade.id;
            await examRepo.save(exam);
          }
        }
      }
    }
  });

  afterAll(async () => {
    await cleanupTestData(dataSource);
    vi.clearAllMocks();
  });

  describe('exportSchoolReport (web)', () => {
    it('should export a single school report and download it', async () => {
      const result = await PDFService.exportSchoolReport(
        bigSchoolId,
        'school_report',
      );

      expect(result.success).toBe(true);
      expect(result.filename).toBe('school_report.pdf');
      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should keep an existing .pdf extension instead of appending', async () => {
      const result = await PDFService.exportSchoolReport(
        bigSchoolId,
        'already.pdf',
      );

      expect(result.success).toBe(true);
      expect(result.filename).toBe('already.pdf');
    });

    it('should export all schools when schoolId is "all"', async () => {
      const result = await PDFService.exportSchoolReport('all', 'all_schools');

      expect(result.success).toBe(true);
      expect(result.filename).toBe('all_schools.pdf');
    });

    it('should throw when the requested school does not exist', async () => {
      await expect(
        PDFService.exportSchoolReport('non-existent-id', 'missing'),
      ).rejects.toThrow('Schule nicht gefunden.');
    });

    it('should throw when there are no schools to export', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const findSpy = vi.spyOn(schoolRepo, 'find').mockResolvedValueOnce([]);

      await expect(
        PDFService.exportSchoolReport('all', 'empty'),
      ).rejects.toThrow('Keine Daten vorhanden.');

      findSpy.mockRestore();
    });

    it('should return a failure result when the web download throws', async () => {
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementationOnce(() => {
          throw new Error('DOM error');
        });
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await PDFService.exportSchoolReport(
        bigSchoolId,
        'fail_web',
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('PDF-Download fehlgeschlagen.');

      createElementSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('exportSchoolReport (native)', () => {
    const mockIsNative = Capacitor.isNativePlatform as unknown as ReturnType<
      typeof vi.fn
    >;

    it('should save and share the PDF on native platforms', async () => {
      mockIsNative.mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/report.pdf',
      });

      const result = await PDFService.exportSchoolReport(
        bigSchoolId,
        'native_report',
      );

      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({ directory: 'DATA' }),
      );
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'file://path/to/report.pdf' }),
      );
      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/_native_report\.pdf$/);

      mockIsNative.mockReturnValue(false);
    });

    it('should still succeed when the native share is cancelled', async () => {
      mockIsNative.mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/report.pdf',
      });
      vi.mocked(Share.share).mockRejectedValueOnce(
        new Error('Share cancelled by user'),
      );

      const result = await PDFService.exportSchoolReport(
        bigSchoolId,
        'cancelled_report',
      );

      expect(result.success).toBe(true);

      mockIsNative.mockReturnValue(false);
    });

    it('should return a failure result when the native share fails', async () => {
      mockIsNative.mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/report.pdf',
      });
      vi.mocked(Share.share).mockRejectedValueOnce(new Error('Sharing failed'));
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await PDFService.exportSchoolReport(
        bigSchoolId,
        'share_fail_report',
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('PDF konnte nicht gespeichert werden.');

      consoleSpy.mockRestore();
      mockIsNative.mockReturnValue(false);
    });

    it('should return a failure result when writing the file fails', async () => {
      mockIsNative.mockReturnValue(true);
      vi.mocked(Filesystem.writeFile).mockRejectedValueOnce(
        new Error('write failed'),
      );
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await PDFService.exportSchoolReport(
        bigSchoolId,
        'write_fail_report',
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('PDF konnte nicht gespeichert werden.');

      consoleSpy.mockRestore();
      mockIsNative.mockReturnValue(false);
    });
  });
});
