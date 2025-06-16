import { DecimalWrapper } from './decimalWrapper';

/**
 * Calculates the weighted average of grades using decimal.js for precise arithmetic
 * @param grades Array of objects containing score and weight
 * @returns The weighted average as a number, or null if no grades
 */
export const calculateWeightedAverage = (
  grades: Array<{ score: number; weight: number }>,
): number | null => {
  if (!grades || grades.length === 0) return null;

  try {
    const totalWeightedScore = grades.reduce((sum, grade) => {
      const score = DecimalWrapper.from(grade.score);
      const weight = DecimalWrapper.from(grade.weight);
      return sum.plus(score.times(weight));
    }, DecimalWrapper.from(0));

    const totalWeight = grades.reduce(
      (sum, grade) => sum.plus(DecimalWrapper.from(grade.weight)),
      DecimalWrapper.from(0),
    );

    if (totalWeight.isZero()) return null;

    return totalWeightedScore.dividedBy(totalWeight).toNumber();
  } catch (error) {
    console.error('Error calculating weighted average:', error);
    return null;
  }
};

/**
 * Validates if a grade is within the valid range (1-6) with proper decimal handling
 * @param grade The grade to validate
 * @returns true if valid, false otherwise
 */
export const isValidGrade = (grade: number): boolean => {
  try {
    const decimalGrade = DecimalWrapper.from(grade);
    return (
      decimalGrade.greaterThanOrEqualTo(1) &&
      decimalGrade.lessThanOrEqualTo(6) &&
      decimalGrade.decimalPlaces() <= 2
    );
  } catch (error) {
    console.error('Error validating grade:', error);
    return false;
  }
};

/**
 * Formats a grade to have at most 2 decimal places
 * @param grade The grade to format
 * @returns The formatted grade as a number
 */
export const formatGrade = (grade: number): number => {
  try {
    return DecimalWrapper.from(grade).toDecimalPlaces(2).toNumber();
  } catch (error) {
    console.error('Error formatting grade:', error);
    return grade;
  }
};
