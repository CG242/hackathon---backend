import { z } from 'zod';

export const CreateTeamDtoSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  projetNom: z.string().optional(),
});
