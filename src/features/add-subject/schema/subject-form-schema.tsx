import { z } from 'zod';

export const subjectFormSchema = z.object({
  newSubjectName: z
    .string()
    .min(1, 'Bitte gib einen Fachnamen ein')
    .max(255, 'Name zu lang'),
});

export type SubjectFormData = z.infer<typeof subjectFormSchema>;
