'use client'

/**
 * Rating Selector Component
 * 
 * A two-part selector for the 38-value rating scale.
 * First selector: Base (1-10)
 * Second selector: Modifier ('', '-', '+', '.5')
 * 
 * When base is 10, modifier is limited to ('', '-')
 */

import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  RATING_BASES,
  RATING_MODIFIERS,
  getValidModifiers,
  formatRating,
  parseRating,
  type RatingValue,
  type RatingBase,
  type RatingModifier,
} from '@/lib/rating-utils'

// ============================================================================
// Props
// ============================================================================

interface RatingSelectorProps {
  value: string | undefined  // e.g., "6.5"
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function RatingSelector({
  value,
  onChange,
  disabled = false,
  className,
}: RatingSelectorProps) {
  const t = useTranslations('matches.ratings')

  // Parse current value
  const parsed = value ? parseRating(value) : null
  const currentBase = parsed?.base ?? 6  // Default to 6
  const currentModifier = parsed?.modifier ?? ''

  // Get valid modifiers for current base
  const validModifiers = getValidModifiers(currentBase)

  /**
   * Handle base change
   */
  const handleBaseChange = (baseStr: string) => {
    const newBase = parseInt(baseStr) as RatingBase
    const newModifiers = getValidModifiers(newBase)

    // If current modifier is not valid for new base, reset to blank
    if (!newModifiers.includes(currentModifier)) {
      onChange(formatRating(newBase, ''))
    } else {
      onChange(formatRating(newBase, currentModifier))
    }
  }

  /**
   * Handle modifier change
   */
  const handleModifierChange = (modifier: string) => {
    onChange(formatRating(currentBase, modifier as RatingModifier))
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Base Selector */}
      <Select
        value={String(currentBase)}
        onValueChange={handleBaseChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20" aria-label={t('selectBase')}>
          <SelectValue placeholder={t('base')} />
        </SelectTrigger>
        <SelectContent>
          {RATING_BASES.map((base) => (
            <SelectItem key={base} value={String(base)}>
              {base}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Modifier Selector */}
      <Select
        value={currentModifier}
        onValueChange={handleModifierChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20" aria-label={t('selectModifier')}>
          <SelectValue placeholder={t('modifier')} />
        </SelectTrigger>
        <SelectContent>
          {validModifiers.map((mod) => (
            <SelectItem key={mod} value={mod}>
              {mod === '' ? '—' : mod}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Display formatted rating */}
      <div className="text-sm font-medium text-muted-foreground min-w-[2rem] text-center">
        {formatRating(currentBase, currentModifier)}
      </div>
    </div>
  )
}

// ============================================================================
// Compact Variant (Single Select with all 38 values)
// ============================================================================

interface RatingSelectorCompactProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * Compact single-select variant
 * Shows all 38 values in a dropdown
 */
export function RatingSelectorCompact({
  value,
  onChange,
  disabled = false,
  className,
  placeholder,
}: RatingSelectorCompactProps) {
  const t = useTranslations('matches.ratings')

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-24', className)}>
        <SelectValue placeholder={placeholder || t('selectRating')} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {RATING_BASES.map((base) => {
          const modifiers = getValidModifiers(base)
          return modifiers.map((mod) => (
            <SelectItem key={formatRating(base, mod)} value={formatRating(base, mod)}>
              {formatRating(base, mod)}
            </SelectItem>
          ))
        })}
      </SelectContent>
    </Select>
  )
}

// ============================================================================
// Rating Display Component
// ============================================================================

interface RatingDisplayProps {
  rating: string | number  // String or decimal value
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

/**
 * Display a rating with color coding
 */
export function RatingDisplay({
  rating,
  size = 'md',
  showLabel = false,
  className,
}: RatingDisplayProps) {
  const { decimalToRating } = require('@/lib/rating-utils')
  const ratingStr = typeof rating === 'number' ? decimalToRating(rating) : rating
  const { ratingToDecimal } = require('@/lib/rating-utils')
  const decimal = typeof rating === 'number' ? rating : ratingToDecimal(rating)

  // Color based on rating value
  const getColorClass = () => {
    if (decimal >= 8) return 'text-green-600 bg-green-50 border-green-200'
    if (decimal >= 7) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (decimal >= 6) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (decimal >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5'
      case 'lg':
        return 'text-lg px-4 py-1.5 font-bold'
      default:
        return 'text-sm px-3 py-1'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        getColorClass(),
        getSizeClass(),
        className
      )}
    >
      {ratingStr}
    </span>
  )
}

// ============================================================================
// Quick Rating Buttons
// ============================================================================

interface QuickRatingButtonsProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Quick rating buttons for common values (6, 6.5, 7, etc.)
 */
export function QuickRatingButtons({
  value,
  onChange,
  disabled = false,
  className,
}: QuickRatingButtonsProps) {
  const commonRatings = ['5', '5.5', '6', '6-', '6.5', '6+', '7', '7.5', '8'] as const

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {commonRatings.map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          disabled={disabled}
          className={cn(
            'px-2 py-1 text-xs rounded border transition-colors',
            value === rating
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-muted border-border'
          )}
        >
          {rating}
        </button>
      ))}
    </div>
  )
}
