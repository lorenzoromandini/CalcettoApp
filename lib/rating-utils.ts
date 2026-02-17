/**
 * Rating Utilities
 * 
 * Constants and helper functions for the 38-value rating scale.
 * 
 * Rating scale:
 * - Base: X, X-, X+, X.5 for each number 1-9
 * - For 10: only 10- and 10 (no 10+ or 10.5)
 * 
 * Storage: Decimal (6.0, 6.25, 6.5, 6.75)
 * Display: String (6, 6-, 6+, 6.5)
 */

// ============================================================================
// Rating Values Array (38 total)
// ============================================================================

/**
 * All 38 valid rating values as strings
 * Ordered from lowest (1) to highest (10)
 */
export const RATING_VALUES = [
  '1', '1-', '1+', '1.5',
  '2', '2-', '2+', '2.5',
  '3', '3-', '3+', '3.5',
  '4', '4-', '4+', '4.5',
  '5', '5-', '5+', '5.5',
  '6', '6-', '6+', '6.5',
  '7', '7-', '7+', '7.5',
  '8', '8-', '8+', '8.5',
  '9', '9-', '9+', '9.5',
  '10-', '10'
] as const

export type RatingValue = typeof RATING_VALUES[number]

// ============================================================================
// Base Rating Numbers (1-10)
// ============================================================================

/**
 * Base rating numbers (integer portion)
 */
export const RATING_BASES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export type RatingBase = typeof RATING_BASES[number]

// ============================================================================
// Rating Modifiers
// ============================================================================

/**
 * Modifiers that can be applied to a base rating
 * - '' (blank): no modifier, e.g., "6" → 6.0
 * - '-': quarter below, e.g., "6-" → 6.25
 * - '.5': half, e.g., "6.5" → 6.5
 * - '+': quarter above, e.g., "6+" → 6.75
 */
export const RATING_MODIFIERS = ['', '-', '.5', '+'] as const

export type RatingModifier = typeof RATING_MODIFIERS[number]

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert a rating string to decimal value
 * 
 * @param rating - Rating string (e.g., "6", "6-", "6+", "6.5")
 * @returns Decimal value (e.g., 6.0, 6.25, 6.75, 6.5)
 * 
 * @example
 * ratingToDecimal('6')   // 6.0
 * ratingToDecimal('6-')  // 6.25
 * ratingToDecimal('6.5') // 6.5
 * ratingToDecimal('6+')  // 6.75
 */
export function ratingToDecimal(rating: string): number {
  // Handle special case: ends with '-'
  if (rating.endsWith('-') && !rating.includes('.5')) {
    const base = parseFloat(rating.slice(0, -1))
    return base + 0.25
  }
  
  // Handle special case: ends with '+'
  if (rating.endsWith('+')) {
    const base = parseFloat(rating.slice(0, -1))
    return base + 0.75
  }
  
  // Handle .5 case or plain number
  return parseFloat(rating)
}

/**
 * Convert a decimal value back to rating string
 * 
 * @param decimal - Decimal value (e.g., 6.0, 6.25, 6.5, 6.75)
 * @returns Rating string (e.g., "6", "6-", "6.5", "6+")
 * 
 * @example
 * decimalToRating(6.0)  // "6"
 * decimalToRating(6.25) // "6-"
 * decimalToRating(6.5)  // "6.5"
 * decimalToRating(6.75) // "6+"
 */
export function decimalToRating(decimal: number): string {
  const base = Math.floor(decimal)
  const fraction = decimal - base
  
  // Determine modifier based on fraction
  if (fraction < 0.125) {
    // ~0.0 → blank (e.g., 6.0 → "6")
    return String(base)
  } else if (fraction < 0.375) {
    // ~0.25 → "-" (e.g., 6.25 → "6-")
    return `${base}-`
  } else if (fraction < 0.625) {
    // ~0.5 → ".5" (e.g., 6.5 → "6.5")
    return `${base}.5`
  } else {
    // ~0.75 → "+" (e.g., 6.75 → "6+")
    return `${base}+`
  }
}

// ============================================================================
// Parse and Format Functions
// ============================================================================

/**
 * Parse a rating string into base and modifier components
 * 
 * @param rating - Rating string (e.g., "6", "6-", "6+", "6.5")
 * @returns Object with base number and modifier
 * 
 * @example
 * parseRating('6')    // { base: 6, modifier: '' }
 * parseRating('6-')   // { base: 6, modifier: '-' }
 * parseRating('6.5')  // { base: 6, modifier: '.5' }
 * parseRating('6+')   // { base: 6, modifier: '+' }
 */
export function parseRating(rating: string): { base: number; modifier: RatingModifier } {
  if (rating.endsWith('-') && !rating.includes('.5')) {
    return {
      base: parseInt(rating.slice(0, -1)),
      modifier: '-'
    }
  }
  
  if (rating.endsWith('+')) {
    return {
      base: parseInt(rating.slice(0, -1)),
      modifier: '+'
    }
  }
  
  if (rating.includes('.5')) {
    return {
      base: parseInt(rating),
      modifier: '.5'
    }
  }
  
  return {
    base: parseInt(rating),
    modifier: ''
  }
}

/**
 * Combine base and modifier into a rating string
 * 
 * @param base - Base number (1-10)
 * @param modifier - Modifier ('', '-', '.5', '+')
 * @returns Rating string
 * 
 * @example
 * formatRating(6, '')   // "6"
 * formatRating(6, '-')  // "6-"
 * formatRating(6, '.5') // "6.5"
 * formatRating(6, '+')  // "6+"
 */
export function formatRating(base: number, modifier: RatingModifier): string {
  if (modifier === '') {
    return String(base)
  }
  return `${base}${modifier}`
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a string is a valid rating value
 * 
 * @param rating - String to check
 * @returns true if valid rating
 */
export function isValidRating(rating: string): rating is RatingValue {
  return RATING_VALUES.includes(rating as RatingValue)
}

/**
 * Get valid modifiers for a base rating
 * - For 1-9: '', '-', '.5', '+'
 * - For 10: '', '-'
 * 
 * @param base - Base number (1-10)
 * @returns Array of valid modifiers
 */
export function getValidModifiers(base: number): RatingModifier[] {
  if (base === 10) {
    // 10 can only be "10" or "10-"
    return ['', '-']
  }
  // 1-9 can have all modifiers
  return [...RATING_MODIFIERS]
}

/**
 * Get all valid rating values for a base number
 * 
 * @param base - Base number (1-10)
 * @returns Array of valid rating strings for this base
 */
export function getValidRatingsForBase(base: number): string[] {
  const modifiers = getValidModifiers(base)
  return modifiers.map(mod => formatRating(base, mod))
}

// ============================================================================
// Display Helpers
// ============================================================================

/**
 * Format rating for display (just returns the string, but useful for consistency)
 * 
 * @param rating - Rating string or decimal
 * @returns Formatted rating string
 */
export function formatRatingForDisplay(rating: string | number): string {
  if (typeof rating === 'number') {
    return decimalToRating(rating)
  }
  return rating
}

/**
 * Get a human-readable description of a rating
 * 
 * @param rating - Rating string or decimal
 * @returns Description in Italian style
 */
export function getRatingDescription(rating: string | number): string {
  const ratingStr = typeof rating === 'number' ? decimalToRating(rating) : rating
  const decimal = typeof rating === 'number' ? rating : ratingToDecimal(rating)
  
  if (decimal >= 9) return 'Eccellente'
  if (decimal >= 8) return 'Molto buono'
  if (decimal >= 7) return 'Buono'
  if (decimal >= 6) return 'Sufficiente'
  if (decimal >= 5) return 'Insufficiente'
  return 'Gravemente insufficiente'
}

// ============================================================================
// Average Calculation
// ============================================================================

/**
 * Calculate average rating from array of decimal values
 * 
 * @param ratings - Array of decimal ratings
 * @returns Average as decimal, or null if empty
 */
export function calculateAverageRating(ratings: number[]): number | null {
  if (ratings.length === 0) return null
  
  const sum = ratings.reduce((acc, val) => acc + val, 0)
  return sum / ratings.length
}

/**
 * Format average rating for display
 * Rounds to 2 decimal places and converts to string
 * 
 * @param average - Average decimal value
 * @returns Formatted average string (e.g., "6.50")
 */
export function formatAverageRating(average: number): string {
  return average.toFixed(2)
}
