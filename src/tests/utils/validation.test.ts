import { describe, it, expect } from 'vitest';
import { 
  validateSubjectName, 
  validateSchoolName, 
  validateUserName, 
  validateSearchText 
} from '@/components/Form/validations';

describe('Form Validations', () => {
  describe('validateSubjectName', () => {
    it('should return undefined for valid subject names', () => {
      expect(validateSubjectName('Math')).toBeUndefined();
      expect(validateSubjectName('Mathematics')).toBeUndefined();
      expect(validateSubjectName('Computer Science')).toBeUndefined();
      expect(validateSubjectName('A'.repeat(100))).toBeUndefined(); // exactly 100 chars
    });

    it('should return error for empty or whitespace-only subject names', () => {
      expect(validateSubjectName('')).toBe('Fachname ist erforderlich');
      expect(validateSubjectName('   ')).toBe('Fachname ist erforderlich');
      expect(validateSubjectName('\t\n')).toBe('Fachname ist erforderlich');
    });

    it('should return error for subject names that are too short', () => {
      expect(validateSubjectName('A')).toBe('Fachname muss mindestens 2 Zeichen lang sein');
    });

    it('should return error for subject names that are too long', () => {
      expect(validateSubjectName('A'.repeat(101))).toBe('Fachname darf maximal 100 Zeichen lang sein');
    });

    it('should handle null or undefined input', () => {
      expect(validateSubjectName(null as any)).toBe('Fachname ist erforderlich');
      expect(validateSubjectName(undefined as any)).toBe('Fachname ist erforderlich');
    });
  });

  describe('validateSchoolName', () => {
    it('should return undefined for valid school names', () => {
      expect(validateSchoolName('ABC School')).toBeUndefined();
      expect(validateSchoolName('Harvard University')).toBeUndefined();
      expect(validateSchoolName('A'.repeat(200))).toBeUndefined(); // exactly 200 chars
    });

    it('should return error for empty or whitespace-only school names', () => {
      expect(validateSchoolName('')).toBe('Schulname ist erforderlich');
      expect(validateSchoolName('   ')).toBe('Schulname ist erforderlich');
      expect(validateSchoolName('\t\n')).toBe('Schulname ist erforderlich');
    });

    it('should return error for school names that are too short', () => {
      expect(validateSchoolName('A')).toBe('Schulname muss mindestens 2 Zeichen lang sein');
    });

    it('should return error for school names that are too long', () => {
      expect(validateSchoolName('A'.repeat(201))).toBe('Schulname darf maximal 200 Zeichen lang sein');
    });

    it('should handle null or undefined input', () => {
      expect(validateSchoolName(null as any)).toBe('Schulname ist erforderlich');
      expect(validateSchoolName(undefined as any)).toBe('Schulname ist erforderlich');
    });
  });

  describe('validateUserName', () => {
    it('should return undefined for valid user names', () => {
      expect(validateUserName('John')).toBeUndefined();
      expect(validateUserName('J')).toBeUndefined(); // exactly 1 char
      expect(validateUserName('A'.repeat(50))).toBeUndefined(); // exactly 50 chars
    });

    it('should return error for empty or whitespace-only user names', () => {
      expect(validateUserName('')).toBe('Name ist erforderlich');
      expect(validateUserName('   ')).toBe('Name ist erforderlich');
      expect(validateUserName('\t\n')).toBe('Name ist erforderlich');
    });

    it('should return error for user names that are too long', () => {
      expect(validateUserName('A'.repeat(51))).toBe('Name darf maximal 50 Zeichen lang sein');
    });

    it('should handle null or undefined input', () => {
      expect(validateUserName(null as any)).toBe('Name ist erforderlich');
      expect(validateUserName(undefined as any)).toBe('Name ist erforderlich');
    });
  });

  describe('validateSearchText', () => {
    it('should return undefined for valid search text', () => {
      expect(validateSearchText('')).toBeUndefined(); // empty is allowed
      expect(validateSearchText('search term')).toBeUndefined();
      expect(validateSearchText('A'.repeat(100))).toBeUndefined(); // exactly 100 chars
    });

    it('should return undefined for null or undefined input', () => {
      expect(validateSearchText(null as any)).toBeUndefined();
      expect(validateSearchText(undefined as any)).toBeUndefined();
    });

    it('should return error for search text that is too long', () => {
      expect(validateSearchText('A'.repeat(101))).toBe('Suchtext zu lang');
    });

    it('should handle whitespace-only input', () => {
      expect(validateSearchText('   ')).toBeUndefined(); // whitespace is allowed for search
    });

    it('should handle special characters', () => {
      expect(validateSearchText('search@#$%^&*()')).toBeUndefined();
      expect(validateSearchText('Ümlauts äöü')).toBeUndefined();
    });

    it('should handle numeric input', () => {
      expect(validateSearchText('12345')).toBeUndefined();
      expect(validateSearchText('Math 101')).toBeUndefined();
    });
  });
});