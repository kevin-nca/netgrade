import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { PreferencesService } from '@/services/PreferencesService';
import { getRepositories } from '../../db/data-source';
import { createMockCurrentSemester } from './setup';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('@/db/data-source', () => ({
  getRepositories: vi.fn(),
}));

describe('PreferencesService', () => {
  const mockPreferencesSet = Preferences.set as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockPreferencesGet = Preferences.get as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeAll(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('saveName', () => {
    it('should save name to Preferences with correct key', async () => {
      // Arrange
      const testName = 'John Doe';
      mockPreferencesSet.mockResolvedValue(undefined);

      // Act
      await PreferencesService.saveName(testName);

      // Assert
      expect(mockPreferencesSet).toHaveBeenCalledTimes(1);
      expect(mockPreferencesSet).toHaveBeenCalledWith({
        key: 'user_name',
        value: testName,
      });
    });

    it('should log error when Preferences.set fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockPreferencesSet.mockRejectedValue(testError);
      const consoleSpy = vi.spyOn(console, 'error');

      // Act
      await PreferencesService.saveName('Test');

      // Assert
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getName', () => {
    it('should get name from Preferences with correct key', async () => {
      // Arrange
      const testName = 'Jane Smith';
      mockPreferencesGet.mockResolvedValue({ value: testName });

      // Act
      const result = await PreferencesService.getName();

      // Assert
      expect(result).toBe(testName);
      expect(mockPreferencesGet).toHaveBeenCalledTimes(1);
      expect(mockPreferencesGet).toHaveBeenCalledWith({
        key: 'user_name',
      });
    });

    it('should return null when no name is stored', async () => {
      // Arrange
      mockPreferencesGet.mockResolvedValue({ value: null });

      // Act
      const result = await PreferencesService.getName();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null and log error when Preferences.get fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockPreferencesGet.mockRejectedValue(testError);
      const consoleSpy = vi.spyOn(console, 'error');

      // Act
      const result = await PreferencesService.getName();

      // Assert
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('onboarding methods', () => {
    it('should set onboarding completed status', async () => {
      // Arrange
      mockPreferencesSet.mockResolvedValue(undefined);

      // Act
      await PreferencesService.setOnboardingCompleted(true);

      // Assert
      expect(mockPreferencesSet).toHaveBeenCalledWith({
        key: 'onboarding_completed',
        value: 'true',
      });
    });

    it('should get onboarding completed status', async () => {
      // Arrange
      mockPreferencesGet.mockResolvedValue({ value: 'true' });

      // Act
      const result = await PreferencesService.isOnboardingCompleted();

      // Assert
      expect(result).toBe(true);
      expect(mockPreferencesGet).toHaveBeenCalledWith({
        key: 'onboarding_completed',
      });
    });

    it('should return false when onboarding status is not set', async () => {
      // Arrange
      mockPreferencesGet.mockResolvedValue({ value: null });

      // Act
      const result = await PreferencesService.isOnboardingCompleted();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getCurrentSemester', () => {
    const mockGetRepositories = getRepositories as unknown as ReturnType<
      typeof vi.fn
    >;

    it('should return the current semester when today is within range', async () => {
      // Arrange
      const today = new Date('2024-10-15');
      vi.setSystemTime(today);

      const mockSemester = createMockCurrentSemester();

      const mockCreateQueryBuilder = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockSemester),
      };

      mockGetRepositories.mockReturnValue({
        semester: {
          createQueryBuilder: vi.fn().mockReturnValue(mockCreateQueryBuilder),
        },
      } as never);

      // Act
      const result = await PreferencesService.getCurrentSemester();

      // Assert
      expect(result).toEqual(mockSemester);
      expect(mockCreateQueryBuilder.where).toHaveBeenCalledWith(
        'semester.startDate <= :today',
        { today },
      );
      expect(mockCreateQueryBuilder.andWhere).toHaveBeenCalledWith(
        'semester.endDate >= :today',
        { today },
      );

      vi.useRealTimers();
    });

    it('should return null when no semester matches today', async () => {
      // Arrange
      const today = new Date('2024-10-15');
      vi.setSystemTime(today);

      const mockCreateQueryBuilder = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      };

      mockGetRepositories.mockReturnValue({
        semester: {
          createQueryBuilder: vi.fn().mockReturnValue(mockCreateQueryBuilder),
        },
      } as never);

      // Act
      const result = await PreferencesService.getCurrentSemester();

      // Assert
      expect(result).toBeNull();

      vi.useRealTimers();
    });

    it('should throw error when database operation fails', async () => {
      // Arrange
      const testError = new Error('Database error');
      const consoleSpy = vi.spyOn(console, 'error');

      mockGetRepositories.mockReturnValue({
        semester: {
          createQueryBuilder: vi.fn().mockImplementation(() => {
            throw testError;
          }),
        },
      } as never);

      // Act & Assert
      await expect(PreferencesService.getCurrentSemester()).rejects.toThrow(
        'Database error',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get current semester:',
        testError,
      );
    });
  });
});
