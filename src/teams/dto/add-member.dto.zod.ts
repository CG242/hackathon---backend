import { z } from 'zod';

export const AddMemberDtoSchema = z.object({
  userId: z.string().min(1, "L'utilisateur est requis"),
  role: z.string().optional(),
});
