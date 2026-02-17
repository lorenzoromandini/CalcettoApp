import { z } from 'zod';

/**
 * Match lifecycle validation schemas
 * 
 * Italian error messages for user-facing validation
 */

/**
 * Start match validation schema
 */
export const startMatchSchema = z.object({
  matchId: z.string().cuid('ID partita non valido'),
});

/**
 * End match validation schema
 */
export const endMatchSchema = z.object({
  matchId: z.string().cuid('ID partita non valido'),
});

/**
 * Complete match validation schema
 */
export const completeMatchSchema = z.object({
  matchId: z.string().cuid('ID partita non valido'),
});

/**
 * Input final results validation schema
 */
export const inputFinalResultsSchema = z.object({
  matchId: z.string().cuid('ID partita non valido'),
  homeScore: z
    .number()
    .int('Il punteggio deve essere un numero intero')
    .min(0, 'Il punteggio non può essere negativo')
    .max(99, 'Il punteggio massimo è 99'),
  awayScore: z
    .number()
    .int('Il punteggio deve essere un numero intero')
    .min(0, 'Il punteggio non può essere negativo')
    .max(99, 'Il punteggio massimo è 99'),
});

// Type inference for forms
export type StartMatchInput = z.infer<typeof startMatchSchema>;
export type EndMatchInput = z.infer<typeof endMatchSchema>;
export type CompleteMatchInput = z.infer<typeof completeMatchSchema>;
export type InputFinalResultsInput = z.infer<typeof inputFinalResultsSchema>;
