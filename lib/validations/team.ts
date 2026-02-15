import { z } from "zod";

/**
 * Team validation schemas
 * 
 * Italian error messages for user-facing validation
 */

// Team mode enum values
export const teamModeEnum = z.enum(["5-a-side", "8-a-side"]);

// Create team schema
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome della squadra è obbligatorio")
    .min(2, "Il nome deve essere di almeno 2 caratteri")
    .max(100, "Il nome non può superare i 100 caratteri"),
  description: z
    .string()
    .max(500, "La descrizione non può superare i 500 caratteri")
    .optional(),
  team_mode: teamModeEnum.default("5-a-side"),
});

// Update team schema - all fields optional
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Il nome deve essere di almeno 2 caratteri")
    .max(100, "Il nome non può superare i 100 caratteri")
    .optional(),
  description: z
    .string()
    .max(500, "La descrizione non può superare i 500 caratteri")
    .optional(),
  team_mode: teamModeEnum.optional(),
});

// Type inference for forms
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type TeamMode = z.infer<typeof teamModeEnum>;
