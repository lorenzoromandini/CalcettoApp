/**
 * Rating Validation Schemas
 * 
 * Zod schemas for validating player rating inputs.
 * Validates the 38-value rating scale with optional comments.
 */

import { z } from 'zod'
import { RATING_VALUES, type RatingValue } from '@/lib/rating-utils'

// ============================================================================
// Rating Input Schema
// ============================================================================

/**
 * Schema for creating/updating a player rating
 */
export const playerRatingSchema = z.object({
  matchId: z.string().cuid({ message: 'ID partita non valido' }),
  playerId: z.string().cuid({ message: 'ID giocatore non valido' }),
  rating: z.custom<RatingValue>(
    (val) => typeof val === 'string' && RATING_VALUES.includes(val as RatingValue),
    { message: 'Voto non valido. Seleziona un valore tra 1 e 10.' }
  ),
  comment: z
    .string()
    .max(500, { message: 'Il commento non può superare i 500 caratteri' })
    .optional(),
})

export type PlayerRatingInput = z.infer<typeof playerRatingSchema>

// ============================================================================
// Bulk Rating Input Schema
// ============================================================================

/**
 * Schema for bulk rating updates
 */
export const bulkRatingSchema = z.object({
  matchId: z.string().cuid({ message: 'ID partita non valido' }),
  ratings: z.array(
    z.object({
      playerId: z.string().cuid({ message: 'ID giocatore non valido' }),
      rating: z.custom<RatingValue>(
        (val) => typeof val === 'string' && RATING_VALUES.includes(val as RatingValue),
        { message: 'Voto non valido' }
      ),
      comment: z.string().max(500).optional(),
    })
  ).min(1, { message: 'Inserisci almeno un voto' }),
})

export type BulkRatingInput = z.infer<typeof bulkRatingSchema>

// ============================================================================
// Single Rating Update Schema (for API routes)
// ============================================================================

/**
 * Schema for updating a single rating (matchId from params, playerId from params)
 */
export const updateRatingSchema = z.object({
  rating: z.custom<RatingValue>(
    (val) => typeof val === 'string' && RATING_VALUES.includes(val as RatingValue),
    { message: 'Voto non valido. Seleziona un valore tra 1 e 10.' }
  ),
  comment: z
    .string()
    .max(500, { message: 'Il commento non può superare i 500 caratteri' })
    .optional()
    .nullable(),
})

export type UpdateRatingInput = z.infer<typeof updateRatingSchema>
