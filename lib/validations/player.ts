import { z } from 'zod';

// Player roles using new enum values (POR, DIF, CEN, ATT)
const playerRoles = ['POR', 'DIF', 'CEN', 'ATT'] as const;

export const createClubMemberSchema = z.object({
  jersey_number: z
    .number()
    .int()
    .min(1, 'Il numero deve essere tra 1 e 99')
    .max(99, 'Il numero deve essere tra 1 e 99'),
  primary_role: z.enum(playerRoles).refine((val) => val !== undefined, {
    message: 'Seleziona un ruolo principale',
  }),
  secondary_roles: z.array(z.enum(playerRoles)).default([]),
});

export type CreateClubMemberInput = z.infer<typeof createClubMemberSchema>;

// Backward compatibility - player schema is now club member schema
export const createPlayerSchema = createClubMemberSchema;
export type CreatePlayerInput = CreateClubMemberInput;
