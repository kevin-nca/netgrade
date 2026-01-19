import { z } from 'zod';

export const editExamSchema = z.object({
  title: z.string().min(1, 'Bitte gib einen Titel ein'),
  date: z.string().min(1, 'Bitte wähle ein Datum aus'),
  subject: z.string().min(1, 'Bitte wähle ein Fach aus'),
  description: z.string(),
});

export type EditExamFormData = z.infer<typeof editExamSchema>;
