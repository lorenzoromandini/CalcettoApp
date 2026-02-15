import { z } from 'zod';

/**
 * Match validation schemas
 * 
 * Italian error messages for user-facing validation
 */

// Match mode enum values
export const matchModeSchema = z.enum(['5vs5', '8vs8']);

// Create match schema
export const createMatchSchema = z.object({
  scheduled_at: z
    .string()
    .min(1, 'Data e ora sono obbligatorie')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Data e ora non valide'),
  location: z
    .string()
    .min(2, 'La location deve essere di almeno 2 caratteri')
    .max(255, 'Location troppo lunga')
    .optional(),
  mode: matchModeSchema,
  notes: z
    .string()
    .max(1000, 'Note troppo lunghe')
    .optional(),
});

// Update match schema - all fields optional
export const updateMatchSchema = createMatchSchema.partial();

// Type inference for forms
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
export type MatchMode = z.infer<typeof matchModeSchema>;
