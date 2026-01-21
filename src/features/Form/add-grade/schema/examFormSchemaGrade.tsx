import { z } from 'zod';
import type { School, Subject } from '@/db/entities';

export const gradeFormSchema = z.object({
  selectedSchool: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Bitte wähle eine Schule aus',
  }),
  selectedSubject: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Bitte wähle ein Fach aus',
  }),
  examName: z.string().min(1, 'Bitte gib einen Prüfungsnamen ein'),
  date: z.string().min(1, 'Bitte wähle ein Datum aus'),
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
  score: z
    .number('Gib eine gültige Zahl ein')
    .min(1, 'Gib eine Zahl zwischen 1-6 ein')
    .max(6, 'Gib eine Zahl zwischen 1-6 ein'),
  comment: z.string(),
});

export type GradeFormData = z.infer<typeof gradeFormSchema> & {
  selectedSchool: School | null;
  selectedSubject: Subject | null;
};
