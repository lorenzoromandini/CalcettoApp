import { z } from 'zod';

/**
 * Goal validation schemas
 * 
 * Italian error messages for user-facing validation
 * Updated to support guest/unknown players
 */

// Add goal schema - supports guest/unknown players
export const addGoalSchema = z.object({
  matchId: z
    .string()
    .min(1, 'ID partita obbligatorio'),
  clubId: z
    .string()
    .min(1, 'ID club obbligatorio'),
  scorerId: z
    .string()
    .optional()
    .nullable(),
  isGuestScorer: z
    .boolean()
    .optional()
    .default(false),
  guestScorerName: z
    .string()
    .optional()
    .nullable(),
  assisterId: z
    .string()
    .optional()
    .nullable(),
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