export interface ExamFormData {
  title: string;
  date: string;
  subject: string;
  description: string;
}

export interface GradeFormData {
  score: number;
  weight: number;
  comment: string;
}

export interface ExamParams {
  examId: string;
}
