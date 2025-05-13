import { describe, it, vi, expect, beforeEach } from 'vitest';
import { OnboardingService } from '@/services/OnboardingService';
import { PreferencesService } from '@/services/PreferencesService';
import { SchoolService } from '@/services/SchoolService';
import { SubjectService } from '@/services/SubjectService';
import { School, Subject } from '@/db/entities';

vi.mock('@/services/PreferencesService');
vi.mock('@/services/SchoolService');
vi.mock('@/services/SubjectService');

describe('OnboardingService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('saveUserName', () => {
    it('should call PreferencesService.saveName with the correct name', async () => {
      // Arrange
      const testName = 'Test User';
      vi.mocked(PreferencesService.saveName).mockResolvedValue(undefined);

      // Act
      await OnboardingService.saveUserName(testName);

      // Assert
      expect(PreferencesService.saveName).toHaveBeenCalledTimes(1);
      expect(PreferencesService.saveName).toHaveBeenCalledWith(testName);
    });

    it('should throw an error when PreferencesService.saveName fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      vi.mocked(PreferencesService.saveName).mockRejectedValue(testError);
      const consoleSpy = vi.spyOn(console, 'error');

      // Act & Assert
      await expect(OnboardingService.saveUserName('Test')).rejects.toThrow(
        'Failed to save user name: Test error',
      );
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save user name:',
        testError,
      );
    });
  });

  describe('getUserName', () => {
    it('should call PreferencesService.getName', async () => {
      // Arrange
      const testName = 'Test User';
      vi.mocked(PreferencesService.getName).mockResolvedValue(testName);

      // Act
      const result = await OnboardingService.getUserName();

      // Assert
      expect(result).toBe(testName);
      expect(PreferencesService.getName).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when PreferencesService.getName fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      vi.mocked(PreferencesService.getName).mockRejectedValue(testError);
      const consoleSpy = vi.spyOn(console, 'error');

      // Act & Assert
      await expect(OnboardingService.getUserName()).rejects.toThrow(
        'Failed to get user name: Test error',
      );
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get user name:',
        testError,
      );
    });
  });

  describe('addSchool', () => {
    it('should call SchoolService.add with the correct data', async () => {
      // Arrange
      const schoolData = {
        name: 'Test School',
        type: 'High School',
        address: '123 Test St',
      };

      const mockSchool = {
        ...schoolData,
        id: 'test-id',
      } as School;

      vi.mocked(SchoolService.add).mockResolvedValue(mockSchool);

      // Act
      const result = await OnboardingService.addSchool(schoolData);

      // Assert
      expect(SchoolService.add).toHaveBeenCalledTimes(1);
      expect(SchoolService.add).toHaveBeenCalledWith(schoolData);
      expect(result).toEqual(mockSchool);
    });

    it('should throw an error when SchoolService.add fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      vi.mocked(SchoolService.add).mockRejectedValue(testError);
      const consoleSpy = vi.spyOn(console, 'error');

      // Act & Assert
      await expect(
        OnboardingService.addSchool({ name: 'Test' }),
      ).rejects.toThrow('Failed to add school: Test error');
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to add school:',
        testError,
      );
    });
  });

  describe('addSubject', () => {
    it('should call SubjectService.add with the correct data', async () => {
      // Arrange
      const subjectData = {
        name: 'Test Subject',
        schoolId: 'test-school-id',
        teacher: 'Test Teacher',
        description: 'Test Description',
        weight: 1.0,
      };

      const mockSubject = {
        ...subjectData,
        id: 'test-id',
      } as Subject;

      vi.mocked(SubjectService.add).mockResolvedValue(mockSubject);

      // Act
      const result = await OnboardingService.addSubject(subjectData);

      // Assert
      expect(SubjectService.add).toHaveBeenCalledTimes(1);
      expect(SubjectService.add).toHaveBeenCalledWith(subjectData);
      expect(result).toEqual(mockSubject);
    });

    it('should throw an error when SubjectService.add fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      vi.mocked(SubjectService.add).mockRejectedValue(testError);
      const consoleSpy = vi.spyOn(console, 'error');

      // Act & Assert
      await expect(
        OnboardingService.addSubject({
          name: 'Test',
          schoolId: 'test-id',
        }),
      ).rejects.toThrow('Failed to add subject: Test error');
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to add subject:',
        testError,
      );
    });
  });

  describe('canCompleteOnboarding', () => {
    it('should return true when userName is provided and hasSchools is true', () => {
      // Act
      const result = OnboardingService.canCompleteOnboarding('Test User', true);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when userName is empty', () => {
      // Act
      const result = OnboardingService.canCompleteOnboarding('', true);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when userName is null', () => {
      // Act
      const result = OnboardingService.canCompleteOnboarding(null, true);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when userName is undefined', () => {
      // Act
      const result = OnboardingService.canCompleteOnboarding(undefined, true);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when hasSchools is false', () => {
      // Act
      const result = OnboardingService.canCompleteOnboarding(
        'Test User',
        false,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when userName has only whitespace', () => {
      // Act
      const result = OnboardingService.canCompleteOnboarding('   ', true);

      // Assert
      expect(result).toBe(false);
    });
  });
});
