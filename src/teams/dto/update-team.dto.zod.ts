import { z } from 'zod';

export const UpdateTeamDtoSchema = z.object({
  nom: z.string().min(1).optional(),
  description: z.string().optional(),
  projetNom: z.string().nullable().optional(),
});
