'use client'

/**
 * Ratings List Component
 * 
 * Display all player ratings in read-only view for completed matches.
 * Shows player name, avatar, rating (formatted), and comment.
 * Sorted by rating descending (best first).
 * Average rating displayed at top.
 */

import { useTranslations } from 'next-intl'
import { User, Users, MessageSquare, Star, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingDisplay } from './rating-selector'
import { cn } from '@/lib/utils'
import { calculateAverageRating, formatAverageRating } from '@/lib/rating-utils'
import type { PlayerRatingWithPlayer } from '@/lib/db/player-ratings'

// ============================================================================
// Props
// ============================================================================

interface RatingsListProps {
  ratings: PlayerRatingWithPlayer[]
  showAverage?: boolean
  className?: string
}

// ============================================================================
// Average Rating Card
// ============================================================================

interface AverageRatingCardProps {
  ratings: PlayerRatingWithPlayer[]
}

function AverageRatingCard({ ratings }: AverageRatingCardProps) {
  const t = useTranslations('matches.ratings')

  if (ratings.length === 0) return null

  const decimals = ratings.map(r => r.rating_decimal)
  const average = calculateAverageRating(decimals)

  if (average === null) return null

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-medium">{t('averageRating')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatAverageRating(average)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({ratings.length} {ratings.length === 1 ? t('player') : t('players')})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Player Rating Row
// ============================================================================

interface PlayerRatingRowProps {
  rating: PlayerRatingWithPlayer
  rank: number
}

function PlayerRatingRow({ rating, rank }: PlayerRatingRowProps) {
  const displayName = rating.player_nickname ||
    `${rating.player_name}${rating.player_surname ? ` ${rating.player_surname}` : ''}`

  // Get medal for top 3
  const getMedal = () => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      {/* Rank */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 font-medium text-sm">
        {getMedal() || rank}
      </div>

      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
        {rating.player_avatar ? (
          <img
            src={rating.player_avatar}
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{displayName}</p>
          {rating.jersey_number > 0 && (
            <Badge variant="outline" className="text-xs h-5 px-1.5 font-mono shrink-0">
              #{rating.jersey_number}
            </Badge>
          )}
        </div>

        {/* Comment */}
        {rating.comment && (
          <div className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
            <p className="line-clamp-2">{rating.comment}</p>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="shrink-0">
        <RatingDisplay rating={rating.rating} size="md" />
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function RatingsList({
  ratings,
  showAverage = true,
  className,
}: RatingsListProps) {
  const t = useTranslations('matches.ratings')

  // Sort by rating descending
  const sortedRatings = [...ratings].sort((a, b) => b.rating_decimal - a.rating_decimal)

  if (sortedRatings.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('noRatings')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Average Rating */}
      {showAverage && <AverageRatingCard ratings={sortedRatings} />}

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('title')}
            <Badge variant="secondary" className="ml-auto">
              {sortedRatings.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedRatings.map((rating, index) => (
            <PlayerRatingRow
              key={rating.id}
              rating={rating}
              rank={index + 1}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Compact Variant (for embedding in other views)
// ============================================================================

interface RatingsListCompactProps {
  ratings: PlayerRatingWithPlayer[]
  maxDisplay?: number
  className?: string
}

export function RatingsListCompact({
  ratings,
  maxDisplay = 3,
  className,
}: RatingsListCompactProps) {
  const t = useTranslations('matches.ratings')

  if (ratings.length === 0) {
    return null
  }

  const decimals = ratings.map(r => r.rating_decimal)
  const average = calculateAverageRating(decimals)
  const sortedRatings = [...ratings]
    .sort((a, b) => b.rating_decimal - a.rating_decimal)
    .slice(0, maxDisplay)

  return (
    <div className={cn('space-y-2', className)}>
      {/* Average */}
      {average !== null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('averageRating')}</span>
          <span className="font-bold text-primary">{formatAverageRating(average)}</span>
        </div>
      )}

      {/* Top Players */}
      <div className="flex items-center gap-1 flex-wrap">
        {sortedRatings.map((rating, index) => (
          <div key={rating.id} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted-foreground text-xs">•</span>}
            <span className="text-sm">
              {rating.player_nickname || rating.player_name}
            </span>
            <RatingDisplay rating={rating.rating} size="sm" />
          </div>
        ))}
        {ratings.length > maxDisplay && (
          <span className="text-xs text-muted-foreground">
            +{ratings.length - maxDisplay} {t('more')}
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Skeleton Loader
// ============================================================================

export function RatingsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-5 w-8 bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
