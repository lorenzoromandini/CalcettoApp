import { z } from 'zod';

/**
 * Goal validation schemas
 * 
 * Italian error messages for user-facing validation
 */

// Add goal schema
export const addGoalSchema = z.object({
  matchId: z
    .string()
    .min(1, 'ID partita obbligatorio'),
  clubId: z
    .string()
    .min(1, 'ID squadra obbligatorio'),
  scorerId: z
    .string()
    .min(1, 'Seleziona il marcatore'),
  assisterId: z
    .string()
    .optional(),
  isOwnGoal: z
    .boolean()
    .optional()
    .default(false),
});

// Remove goal schema
export const removeGoalSchema = z.object({
  goalId: z
    .string()
    .min(1, 'ID gol obbligatorio'),
});

// Type inference for forms
export type AddGoalInput = z.infer<typeof addGoalSchema>;
export type RemoveGoalInput = z.infer<typeof removeGoalSchema>;
