import { School, Subject } from '@/db/entities';

export interface OnboardingData {
  userName: string;
  schools: School[];
  subjects: Subject[];
}

export interface TempSchool {
  id: string;
  name: string;
  address?: string | null;
  type?: string | null;
}

export interface TempSubject {
  id: string;
  name: string;
  teacher?: string | null;
  description?: string | null;
  weight?: number | null;
  schoolId: string;
}

export interface OnboardingDataTemp {
  userName: string;
  schools: TempSchool[];
  subjects: TempSubject[];
}

export const SCHOOL_TYPES = [
  'Gymnasium',
  'Berufsschule',
  'Berufsmaturitätsschule',
  'Andere',
];
