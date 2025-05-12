import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { UserService } from '@/services/UserService';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
  },
}));

describe('UserService', () => {
  const mockPreferencesSet = Preferences.set as unknown as ReturnType<typeof vi.fn>;
  const mockPreferencesGet = Preferences.get as unknown as ReturnType<typeof vi.fn>;

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
      await UserService.saveName(testName);

      // Assert
      expect(mockPreferencesSet).toHaveBeenCalledTimes(1);
      expect(mockPreferencesSet).toHaveBeenCalledWith({
        key: 'user_name',
        value: testName,
      });
    });

    it('should throw an error when Preferences.set fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockPreferencesSet.mockRejectedValue(testError);

      // Act & Assert
      await expect(UserService.saveName('Test')).rejects.toThrow();

      // Check that the error is logged
      const consoleSpy = vi.spyOn(console, 'error');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getName', () => {
    it('should get name from Preferences with correct key', async () => {
      // Arrange
      const testName = 'Jane Smith';
      mockPreferencesGet.mockResolvedValue({ value: testName });

      // Act
      const result = await UserService.getName();

      // Assert
      expect(result).toBe(testName);
      expect(mockPreferencesGet).toHaveBeenCalledTimes(1);
      expect(mockPreferencesGet).toHaveBeenCalledWith({ key: 'user_name' });
    });

    it('should return null when no name is stored', async () => {
      // Arrange
      mockPreferencesGet.mockResolvedValue({ value: null });

      // Act
      const result = await UserService.getName();

      // Assert
      expect(result).toBeNull();
    });

    it('should throw an error when Preferences.get fails', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockPreferencesGet.mockRejectedValue(testError);

      // Act & Assert
      await expect(UserService.getName()).rejects.toThrow();

      // Check that the error is logged
      const consoleSpy = vi.spyOn(console, 'error');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
