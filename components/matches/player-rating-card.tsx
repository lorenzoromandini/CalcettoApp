'use client'

/**
 * Player Rating Card Component
 * 
 * A card for rating a single player with:
 * - Player avatar and name
 * - Rating selector
 * - Optional comment textarea (collapsible)
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { User, MessageSquare, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RatingSelector, RatingDisplay } from './rating-selector'
import { cn } from '@/lib/utils'
import type { RatingValue } from '@/lib/rating-utils'
import type { PlayerRating } from '@/lib/db/player-ratings'

// ============================================================================
// Types
// ============================================================================

interface Player {
  id: string
  name: string
  surname?: string
  nickname?: string
  avatarUrl?: string
  jerseyNumber?: number
}

interface PlayerRatingCardProps {
  player: Player
  currentRating?: PlayerRating
  onRatingChange: (rating: string) => void
  onCommentChange?: (comment: string) => void
  disabled?: boolean
  showJerseyNumber?: boolean
  isPending?: boolean
}

// ============================================================================
// Component
// ============================================================================

export function PlayerRatingCard({
  player,
  currentRating,
  onRatingChange,
  onCommentChange,
  disabled = false,
  showJerseyNumber = true,
  isPending = false,
}: PlayerRatingCardProps) {
  const t = useTranslations('matches.ratings')
  const [showComment, setShowComment] = useState(!!currentRating?.comment)

  const displayName = player.nickname ||
    `${player.name}${player.surname ? ` ${player.surname}` : ''}`

  const hasRating = !!currentRating?.rating

  return (
    <Card
      className={cn(
        'transition-all',
        hasRating ? 'border-primary/30 bg-primary/5' : 'border-border',
        isPending && 'opacity-70'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={displayName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>

          {/* Player Info & Rating */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium truncate">{displayName}</p>

              {/* Jersey Number Badge */}
              {showJerseyNumber && player.jerseyNumber && player.jerseyNumber > 0 && (
                <Badge variant="outline" className="text-xs h-5 px-1.5 font-mono shrink-0">
                  #{player.jerseyNumber}
                </Badge>
              )}

              {/* Rating Badge (if set) */}
              {hasRating && (
                <RatingDisplay rating={currentRating.rating} size="sm" />
              )}
            </div>

            {/* Rating Selector */}
            <div className="mt-2">
              <RatingSelector
                value={currentRating?.rating}
                onChange={onRatingChange}
                disabled={disabled}
              />
            </div>

            {/* Comment Toggle */}
            {onCommentChange && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => setShowComment(!showComment)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {showComment ? t('hideComment') : t('addComment')}
                  {showComment ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>
            )}

            {/* Comment Textarea */}
            {showComment && onCommentChange && (
              <div className="mt-2">
                <Textarea
                  value={currentRating?.comment || ''}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder={t('commentPlaceholder')}
                  disabled={disabled}
                  rows={2}
                  maxLength={500}
                  className="text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(currentRating?.comment?.length || 0)}/500
                </p>
              </div>
            )}
          </div>

          {/* Pending Indicator */}
          {isPending && (
            <div className="shrink-0">
              <div className="h-4 w-4 rounded-full bg-primary/20 animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Compact Variant
// ============================================================================

interface PlayerRatingCardCompactProps {
  player: Player
  currentRating?: PlayerRating
  onRatingChange: (rating: string) => void
  disabled?: boolean
  showJerseyNumber?: boolean
}

/**
 * Compact variant for list view
 */
export function PlayerRatingCardCompact({
  player,
  currentRating,
  onRatingChange,
  disabled = false,
  showJerseyNumber = true,
}: PlayerRatingCardCompactProps) {
  const displayName = player.nickname ||
    `${player.name}${player.surname ? ` ${player.surname}` : ''}`

  const hasRating = !!currentRating?.rating

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        hasRating ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
      )}
    >
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{displayName}</p>
          {showJerseyNumber && player.jerseyNumber && player.jerseyNumber > 0 && (
            <Badge variant="outline" className="text-xs h-5 px-1 font-mono shrink-0">
              #{player.jerseyNumber}
            </Badge>
          )}
        </div>
      </div>

      {/* Rating Selector */}
      <RatingSelector
        value={currentRating?.rating}
        onChange={onRatingChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  )
}

// ============================================================================
// Skeleton Loader
// ============================================================================

export function PlayerRatingCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
