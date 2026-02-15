import { z } from 'zod';
import type { PlayerRole } from '@/lib/db/schema';

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
    .union([
      z.number().int().min(1).max(99),
      z.string().transform((val) => (val === '' ? undefined : parseInt(val, 10))),
      z.undefined(),
    ])
    .optional()
    .refine((val) => val === undefined || (val >= 1 && val <= 99), {
      message: 'Il numero deve essere tra 1 e 99',
    }),
  roles: z.array(z.enum(['goalkeeper', 'defender', 'midfielder', 'attacker'])).default([]),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
