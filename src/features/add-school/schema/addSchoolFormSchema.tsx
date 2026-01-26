import { z } from 'zod';

export const schoolFormSchema = z.object({
  schoolName: z.string().min(1, 'Bitte gib einen Schulnamen ein'),
});

export type SchoolFormData = z.infer<typeof schoolFormSchema>;
