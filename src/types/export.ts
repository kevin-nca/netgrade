export interface ExportGrade {
  score: number;
  weight: number;
  comment: string | null;
  date: Date;
}

export interface ExportExam {
  name: string;
  date: Date;
  description: string | null;
  weight: number;
  isCompleted: boolean;
  grade: ExportGrade | null;
}

export interface ExportSubject {
  name: string;
  teacher: string;
  description: string | null;
  weight: number;
  exams: ExportExam[];
}

export interface ExportSchool {
  name: string;
  address: string | null;
}

export interface ExportSummary {
  perSubjectAverages: Record<string, number>;
  overallAverage: number;
  examsCompleted: number;
  examsTotal: number;
}

export interface ExportData {
  school: ExportSchool;
  subjects: ExportSubject[];
  summaries: ExportSummary;
}

export interface ExportOptions {
  includeSummaries?: boolean;
  format: 'json' | 'csv' | 'xlsx';
  filename?: string;
}
