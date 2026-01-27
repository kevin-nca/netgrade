import { z } from 'zod';

export const editSubjectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Bitte gib einen Fachnamen ein')
    .max(100, 'Fachname ist zu lang'),
});

export type EditSubjectFormData = z.infer<typeof editSubjectFormSchema>;
