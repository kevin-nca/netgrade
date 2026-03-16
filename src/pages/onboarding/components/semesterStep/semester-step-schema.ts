import { z } from 'zod';

export const semesterStepSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Bitte gib einen Semesternamen ein')
      .max(255, 'Name zu lang'),
    startDate: z.string().min(1, 'Bitte wähle ein Startdatum'),
    endDate: z.string().min(1, 'Bitte wähle ein Enddatum'),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Das Enddatum muss nach dem Startdatum liegen',
    path: ['endDate'],
  });

export type SemesterStepFormData = z.infer<typeof semesterStepSchema>;
