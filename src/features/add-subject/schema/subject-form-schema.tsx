import { z } from 'zod';

export const subjectFormSchema = (existingNames: string[]) =>
  z.object({
    newSubjectName: z
      .string()
      .min(1, 'Bitte gib einen Fachnamen ein')
      .max(255, 'Name zu lang')
      .refine(
        (name) =>
          !existingNames.some(
            (existing) => existing.toLowerCase() === name.trim().toLowerCase(),
          ),
        'Fach existiert bereits',
      ),
  });

export type SubjectFormData = {
  newSubjectName: string;
};
