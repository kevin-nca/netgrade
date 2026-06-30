import { z } from 'zod';
import type { School, Subject } from '@/db/entities';

export const scanExamSchema = z.object({
  selectedSchool: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Bitte wähle eine Schule aus',
  }),
  selectedSubject: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Bitte wähle ein Fach aus',
  }),
  examName: z.string().min(1, 'Bitte gib einen Prüfungsnamen ein'),
  date: z.string().min(1, 'Bitte wähle ein Datum aus'),
  score: z
    .number()
    .min(1, 'Note muss zwischen 1 und 6 liegen')
    .max(6, 'Note muss zwischen 1 und 6 liegen'),
  weight: z.string(),
});

export type ScanExamFormData = z.infer<typeof scanExamSchema> & {
  selectedSchool: School | null;
  selectedSubject: Subject | null;
};
