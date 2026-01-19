import { z } from 'zod';

export const editGradeSchema = z.object({
  examName: z.string().min(1, 'Bitte gib einen Prüfungsnamen ein'),
  score: z
    .number({ message: 'Gib eine gültige Zahl ein' })
    .min(1, 'Gib eine Zahl zwischen 1-6 ein')
    .max(6, 'Gib eine Zahl zwischen 1-6 ein'),
  weight: z
    .string()
    .min(1, 'Bitte gib eine Gewichtung ein')
    .refine(
      (val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      { message: 'Die Gewichtung muss zwischen 0 und 100 sein' },
    ),
  date: z.string().min(1, 'Bitte wähle ein Datum aus'),
  comment: z.string(),
});

export type EditGradeFormData = z.infer<typeof editGradeSchema>;

export interface GradeEntryParams {
  schoolId: string;
  subjectId: string;
}
