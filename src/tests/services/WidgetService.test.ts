import { describe, it, vi, expect, beforeEach, afterAll } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { WidgetBridgePlugin } from 'capacitor-widget-bridge';
import { ExamService } from '@/services/ExamService';
import {
  createMockWidgetExams,
  createMockWidgetExamsOverLimit,
  createMockWidgetExamWithoutSubject,
} from './setup';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
  },
}));

vi.mock('capacitor-widget-bridge', () => ({
  WidgetBridgePlugin: {
    setItem: vi.fn(),
    reloadTimelines: vi.fn(),
  },
}));

vi.mock('@/services/ExamService', () => ({
  ExamService: {
    fetchUpcoming: vi.fn(),
  },
}));

describe('WidgetService', () => {
  const mockIsNativePlatform = Capacitor.isNativePlatform as ReturnType<
    typeof vi.fn
  >;
  const mockSetItem = WidgetBridgePlugin.setItem as ReturnType<typeof vi.fn>;
  const mockReloadTimelines = WidgetBridgePlugin.reloadTimelines as ReturnType<
    typeof vi.fn
  >;
  const mockFetchUpcoming = ExamService.fetchUpcoming as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('sync', () => {
    it('should do nothing when not on a native platform', async () => {
      // Arrange
      mockIsNativePlatform.mockReturnValue(false);

      // Act
      const { WidgetService } = await import('@/services/WidgetService');
      await WidgetService.sync();

      // Assert
      expect(mockFetchUpcoming).not.toHaveBeenCalled();
      expect(mockSetItem).not.toHaveBeenCalled();
      expect(mockReloadTimelines).not.toHaveBeenCalled();
    });

    it('should write upcoming exams and reload timeline on native platform', async () => {
      // Arrange
      mockIsNativePlatform.mockReturnValue(true);
      mockSetItem.mockResolvedValue(undefined);
      mockReloadTimelines.mockResolvedValue(undefined);
      mockFetchUpcoming.mockResolvedValue(createMockWidgetExams());

      // Act
      const { WidgetService } = await import('@/services/WidgetService');
      await WidgetService.sync();

      // Assert
      expect(mockFetchUpcoming).toHaveBeenCalledTimes(1);
      expect(mockSetItem).toHaveBeenCalledTimes(1);
      expect(mockSetItem).toHaveBeenCalledWith({
        key: 'next_exams',
        group: 'group.com.netgrade.app',
        value: JSON.stringify([
          {
            id: 'exam-1',
            name: 'Mathematik Klausur',
            subjectName: 'Mathematik',
            date: new Date('2026-06-10T10:00:00.000Z').toISOString(),
          },
          {
            id: 'exam-2',
            name: 'Physik Test',
            subjectName: 'Physik',
            date: new Date('2026-06-15T14:00:00.000Z').toISOString(),
          },
        ]),
      });
      expect(mockReloadTimelines).toHaveBeenCalledTimes(1);
      expect(mockReloadTimelines).toHaveBeenCalledWith({
        ofKind: 'ExamsWidget',
      });
    });

    it('should limit synced exams to 3', async () => {
      // Arrange
      mockIsNativePlatform.mockReturnValue(true);
      mockSetItem.mockResolvedValue(undefined);
      mockReloadTimelines.mockResolvedValue(undefined);
      mockFetchUpcoming.mockResolvedValue(createMockWidgetExamsOverLimit());

      // Act
      const { WidgetService } = await import('@/services/WidgetService');
      await WidgetService.sync();

      // Assert
      const writtenValue = JSON.parse(mockSetItem.mock.calls.at(-1)![0].value);
      expect(writtenValue).toHaveLength(3);
      expect(writtenValue[0].id).toBe('exam-1');
      expect(writtenValue[1].id).toBe('exam-2');
      expect(writtenValue[2].id).toBe('exam-3');
    });

    it('should use empty string for subjectName when subject is missing', async () => {
      // Arrange
      mockIsNativePlatform.mockReturnValue(true);
      mockSetItem.mockResolvedValue(undefined);
      mockReloadTimelines.mockResolvedValue(undefined);
      mockFetchUpcoming.mockResolvedValue(createMockWidgetExamWithoutSubject());

      // Act
      const { WidgetService } = await import('@/services/WidgetService');
      await WidgetService.sync();

      // Assert
      const writtenValue = JSON.parse(mockSetItem.mock.calls.at(-1)![0].value);
      expect(writtenValue[0].subjectName).toBe('');
    });

    it('should log error and not throw when sync fails', async () => {
      // Arrange
      mockIsNativePlatform.mockReturnValue(true);
      mockFetchUpcoming.mockRejectedValue(new Error('DB error'));
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Act
      const { WidgetService } = await import('@/services/WidgetService');
      await expect(WidgetService.sync()).resolves.toBeUndefined();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'WidgetService.sync failed:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('should do nothing when not on a native platform', async () => {
      // Arrange
      mockIsNativePlatform.mockReturnValue(false);

      // Act
      const { WidgetService } = await import('@/services/WidgetService');
      await WidgetService.clear();

      // Assert
      expect(mockSetItem).not.toHaveBeenCalled();
      expect(mockReloadTimelines).not.toHaveBeenCalled();
    });

    it('should write an empty list and reload timeline on native platform', async () => {
      // Arrange
      mockIsNativePlatform.mockReturnValue(true);
      mockSetItem.mockResolvedValue(undefined);
      mockReloadTimelines.mockResolvedValue(undefined);

      // Act
      const { WidgetService } = await import('@/services/WidgetService');
      await WidgetService.clear();

      // Assert
      expect(mockSetItem).toHaveBeenCalledTimes(1);
      expect(mockSetItem).toHaveBeenCalledWith({
        key: 'next_exams',
        group: 'group.com.netgrade.app',
        value: JSON.stringify([]),
      });
      expect(mockReloadTimelines).toHaveBeenCalledTimes(1);
      expect(mockReloadTimelines).toHaveBeenCalledWith({
        ofKind: 'ExamsWidget',
      });
    });

    it('should log error and not throw when clear fails', async () => {
      // Arrange
      mockIsNativePlatform.mockReturnValue(true);
      mockSetItem.mockRejectedValue(new Error('Plugin error'));
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Act
      const { WidgetService } = await import('@/services/WidgetService');
      await expect(WidgetService.clear()).resolves.toBeUndefined();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'WidgetService.clear failed:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });
});
