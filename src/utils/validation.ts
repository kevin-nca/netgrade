export const validateGrade = (value: number): string | null => {
  if (value < 1 || value > 6)
    return 'Bitte eine Zahl zwischen 1 und 6 eingeben.';
  if (
    value.toString().includes('.') &&
    value.toString().split('.')[1].length > 2
  ) {
    return 'Die Note darf maximal zwei Dezimalstellen haben.';
  }
  return null;
};

export const validateWeight = (value: number): string | null => {
  if (value < 0 || value > 100)
    return 'Bitte eine Zahl zwischen 0 und 100 eingeben.';
  if (
    value.toString().includes('.') &&
    value.toString().split('.')[1].length > 2
  ) {
    return 'Die Gewichtung darf maximal zwei Dezimalstellen haben.';
  }
  return null;
};

export const percentageToDecimal = (percentage: number): number => {
  return percentage / 100;
};

export const decimalToPercentage = (decimal: number): number => {
  return decimal * 100;
};
