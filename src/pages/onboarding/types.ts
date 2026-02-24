import { School, Semester, Subject } from '@/db/entities';

export interface OnboardingData {
  userName: string;
  semesters: Semester[];
  schools: School[];
  subjects: Subject[];
}

export interface TempSemester {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
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
  semesterId: string;
}

export interface OnboardingDataTemp {
  userName: string;
  semesters: TempSemester[];
  schools: TempSchool[];
  subjects: TempSubject[];
}

export const SCHOOL_TYPES = [
  'Gymnasium',
  'Berufsschule',
  'Berufsmaturitätsschule',
  'Andere',
];
