import { PreferencesService } from './PreferencesService';
import { SubjectService } from './SubjectService';
import { SchoolService } from './SchoolService';

/**
 * Service to handle all onboarding-related operations
 */
export class OnboardingService {
  /**
   * Saves the user's name
   * @param name User name to save
   * @returns Promise<void>
   */
  static async saveUserName(name: string): Promise<void> {
    try {
      await PreferencesService.saveName(name);
    } catch (error) {
      console.error('Failed to save user name:', error);
      throw new Error(
        `Failed to save user name: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Gets the user's saved name
   * @returns Promise<string | null>
   */
  static async getUserName(): Promise<string | null> {
    try {
      return await PreferencesService.getName();
    } catch (error) {
      console.error('Failed to get user name:', error);
      throw new Error(
        `Failed to get user name: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Adds a subject for a school
   * @param data Subject data to add
   * @returns Promise with the created subject
   */
  static async addSubject(data: {
    name: string;
    schoolId: string;
    teacher?: string | null;
    description?: string | null;
    weight?: number;
  }) {
    try {
      return await SubjectService.add(data);
    } catch (error) {
      console.error('Failed to add subject:', error);
      throw new Error(
        `Failed to add subject: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Adds a school
   * @param data School data to add
   * @returns Promise with the created school
   */
  static async addSchool(data: {
    name: string;
    type?: string;
    address?: string;
  }) {
    try {
      return await SchoolService.add(data);
    } catch (error) {
      console.error('Failed to add school:', error);
      throw new Error(
        `Failed to add school: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Checks if the minimum onboarding requirements are met
   * @param userName The user's name
   * @param hasSchools Whether schools have been added
   * @returns boolean indicating if onboarding can be completed
   */
  static canCompleteOnboarding(
    userName: string | null | undefined,
    hasSchools: boolean,
  ): boolean {
    return !!userName && userName.trim().length > 0 && hasSchools;
  }
}
