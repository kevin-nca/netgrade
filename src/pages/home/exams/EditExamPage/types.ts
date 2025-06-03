import { FormApi } from '@tanstack/react-form';

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

export type ExamFormApi = FormApi<ExamFormData>; //todo muss anderst gelöst werden
export type GradeFormApi = FormApi<GradeFormData>;
