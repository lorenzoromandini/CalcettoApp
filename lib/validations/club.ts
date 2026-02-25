import { z } from "zod";

/**
 * Club validation schemas
 * 
 * Italian error messages for user-facing validation
 */

// Create club schema
export const createClubSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome del club è obbligatorio")
    .min(2, "Il nome deve essere di almeno 2 caratteri")
    .max(100, "Il nome non può superare i 100 caratteri"),
  description: z
    .string()
    .max(500, "La descrizione non può superare i 500 caratteri")
    .optional(),
  image_url: z
    .string()
    .url("URL immagine non valido")
    .optional(),
});

// Update club schema - all fields optional
export const updateClubSchema = z.object({
  name: z
    .string()
    .min(2, "Il nome deve essere di almeno 2 caratteri")
    .max(100, "Il nome non può superare i 100 caratteri")
    .optional()
    .nullable(),
  description: z
    .string()
    .max(500, "La descrizione non può superare i 500 caratteri")
    .optional()
    .nullable(),
  image_url: z
    .string()
    .url("URL immagine non valido")
    .optional()
    .nullable(),
});

// Type inference for forms
export type CreateClubInput = z.infer<typeof createClubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;
