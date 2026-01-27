import { z } from 'zod';
import type { School, Subject } from '@/db/entities';

export const examFormSchema = z.object({
  selectedSchool: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Bitte wähle eine Schule aus',
  }),
  selectedSubject: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Bitte wähle ein Fach aus',
  }),
  examName: z.string().min(1, 'Bitte gib einen Prüfungsnamen ein'),
  date: z.string().min(1, 'Bitte wähle ein Datum aus'),
  description: z.string(),
});

export type ExamFormData = z.infer<typeof examFormSchema> & {
  selectedSchool: School | null;
  selectedSubject: Subject | null;
};
