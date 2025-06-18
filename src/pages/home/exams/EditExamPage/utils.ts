import { DecimalWrapper } from '@/utils/decimalWrapper';

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('de-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const getGradeColor = (score: number): string => {
  const decimalScore = DecimalWrapper.from(score);
  if (decimalScore.greaterThanOrEqualTo(5.5)) return 'success';
  if (decimalScore.greaterThanOrEqualTo(4.5)) return 'primary';
  if (decimalScore.greaterThanOrEqualTo(4)) return 'warning';
  return 'danger';
};
