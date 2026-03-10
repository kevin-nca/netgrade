import { z } from 'zod';

export const semesterFormSchema = z
  .object({
    semesterName: z.string().min(1, 'Bitte gib einen Semesternamen ein'),
    startDate: z.string().min(1, 'Bitte wähle ein Startdatum'),
    endDate: z.string().min(1, 'Bitte wähle ein Enddatum'),
    schoolId: z.any().refine((val) => val !== null && val !== undefined, {
      message: 'Bitte wähle eine Schule aus',
    }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Das Enddatum muss nach dem Startdatum liegen',
    path: ['endDate'],
  });

export type SemesterFormData = z.infer<typeof semesterFormSchema>;
