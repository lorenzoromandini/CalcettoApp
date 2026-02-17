import { z } from 'zod';
import type { PlayerRole } from '@/lib/db/schema';

// Player roles enum
const playerRoles = ['goalkeeper', 'defender', 'midfielder', 'attacker'] as const;

export const createPlayerSchema = z.object({
  name: z
    .string()
    .min(1, 'Il nome è obbligatorio')
    .max(50, 'Il nome non può superare i 50 caratteri'),
  surname: z
    .string()
    .max(50, 'Il cognome non può superare i 50 caratteri')
    .optional()
    .or(z.literal('')),
  nickname: z
    .string()
    .max(50, 'Il nickname non può superare i 50 caratteri')
    .optional()
    .or(z.literal('')),
  jersey_number: z
    .number()
    .int()
    .min(1, 'Il numero deve essere tra 1 e 99')
    .max(99, 'Il numero deve essere tra 1 e 99')
    .optional(),
  // roles[0] = primary role (required), roles[1:] = other roles (optional)
  roles: z
    .array(z.enum(playerRoles))
    .min(1, 'Seleziona almeno un ruolo principale'),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
