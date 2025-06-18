import { isValidGrade } from './gradeCalculations';
import { DecimalWrapper } from './decimalWrapper';

export const validateGrade = (value: number): string | null => {
  try {
    const decimalGrade = DecimalWrapper.from(value);
    if (!isValidGrade(value)) {
      return 'Bitte eine Zahl zwischen 1 und 6 mit maximal zwei Dezimalstellen eingeben.';
    }
    return null;
  } catch (error) {
    return 'Ungültige Note. Bitte eine Zahl zwischen 1 und 6 eingeben.';
  }
};

export const validateWeight = (value: number): string | null => {
  try {
    const decimalWeight = DecimalWrapper.from(value);
    if (decimalWeight.lessThanOrEqualTo(0)) {
      return 'Die Gewichtung muss größer als 0 sein.';
    }
    if (decimalWeight.decimalPlaces() > 2) {
      return 'Die Gewichtung darf maximal zwei Dezimalstellen haben.';
    }
    return null;
  } catch (error) {
    return 'Ungültige Gewichtung. Bitte eine positive Zahl eingeben.';
  }
};

export const percentageToDecimal = (percentage: number): number => {
  return percentage / 100;
};

export const decimalToPercentage = (decimal: number): number => {
  return decimal * 100;
};
