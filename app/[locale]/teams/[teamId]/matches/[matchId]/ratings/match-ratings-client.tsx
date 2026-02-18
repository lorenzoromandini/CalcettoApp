'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Match Ratings Client Component
 * 
 * Displays player ratings for a match with:
 * - List of players who played (played=true)
 * - Rating input per player (only editable in FINISHED state)
 * - Optional comment per player
 * - Count of rated/total players
 * - Read-only view for completed matches
 */

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, Users, Lock, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { MatchStatusBadge } from '@/components/matches/match-status-badge'
import { PlayerRatingCard } from '@/components/matches/player-rating-card'
import { RatingsList } from '@/components/matches/ratings-list'
import { usePlayerRatings } from '@/hooks/use-player-ratings'
import { cn } from '@/lib/utils'
import type { Match } from '@/lib/db/schema'
import type { MatchPlayerWithPlayer } from '@/lib/db/player-participation'
import type { PlayerRatingWithPlayer } from '@/lib/db/player-ratings'

// ============================================================================
// Component Props
// ============================================================================

interface MatchRatingsClientProps {
  locale: string
  teamId: string
  matchId: string
  match: Match
  playedPlayers: MatchPlayerWithPlayer[]
  initialRatings: PlayerRatingWithPlayer[]
  isAdmin: boolean
  canEdit: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDateFull(dateString: string, locale: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getModeLabel(mode: Match['mode'], t: ReturnType<typeof useTranslations>): string {
  switch (mode) {
    case '5vs5':
      return t('mode.5vs5')
    case '8vs8':
      return t('mode.8vs8')
    default:
      return mode
  }
}

// ============================================================================
// Component Implementation
// ============================================================================

export function MatchRatingsClient({
  locale,
  teamId,
  matchId,
  match,
  playedPlayers,
  initialRatings,
  isAdmin,
  canEdit,
}: MatchRatingsClientProps) {
  const t = useTranslations('matches')
  const tRatings = useTranslations('matches.ratings')
  const router = useRouter()

  // Use ratings hook
  const {
    ratings,
    localRatings,
    isLoading,
    counts,
    setRating,
    refresh,
  } = usePlayerRatings(matchId)

  // Track pending saves
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null)

  // Merge initial ratings with live ratings
  const allRatings = ratings.length > 0 ? ratings : initialRatings

  // Create a map for quick lookup
  const ratingsMap = new Map(allRatings.map(r => [r.player_id, r]))

  const handleBack = () => {
    router.push(`/${locale}/teams/${teamId}/matches/${matchId}`)
  }

  /**
   * Handle rating change for a player
   */
  const handleRatingChange = useCallback(async (playerId: string, rating: string) => {
    setPendingPlayerId(playerId)
    try {
      await setRating(playerId, rating as any, localRatings.get(playerId)?.comment)
    } finally {
      setPendingPlayerId(null)
    }
  }, [setRating, localRatings])

  /**
   * Handle comment change (just update local state, don't save yet)
   */
  const handleCommentChange = useCallback((playerId: string, comment: string) => {
    // Update local state - will be saved when rating is changed
    // For now, we'll save immediately
    const currentRating = ratingsMap.get(playerId)?.rating || localRatings.get(playerId)?.rating
    if (currentRating) {
      setRating(playerId, currentRating as any, comment)
    }
  }, [ratingsMap, localRatings, setRating])

  const isCompleted = match.status === 'COMPLETED'
  const isFinished = match.status === 'FINISHED'

  // Calculate progress
  const progressPercent = playedPlayers.length > 0 
    ? Math.round((counts.rated / playedPlayers.length) * 100)
    : 0

  // No played players
  if (playedPlayers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              {tRatings('title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{tRatings('noPlayedPlayers')}</p>
              <p className="text-sm mt-1">{tRatings('markPlayersFirst')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back')}
      </Button>

      {/* Match Header */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <MatchStatusBadge status={match.status} />
                <Badge variant="outline">{getModeLabel(match.mode, t)}</Badge>
                {isCompleted && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    {t('status.completed')}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">
                {formatDateFull(match.scheduled_at, locale)}
              </CardTitle>
              {match.location && (
                <p className="text-sm text-muted-foreground mt-1">{match.location}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Card (only in edit mode) */}
      {canEdit && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                {tRatings('progress')}
              </span>
              <span className="text-sm text-muted-foreground">
                {counts.rated} {tRatings('of')} {playedPlayers.length} {tRatings('playersRated')}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Edit Mode: Rating Cards */}
      {canEdit && (
        <div className="space-y-3">
          {playedPlayers.map((player) => {
            const currentRating = ratingsMap.get(player.player_id)
            const localRating = localRatings.get(player.player_id)
            const isPending = pendingPlayerId === player.player_id || localRating?.isPending

            return (
              <PlayerRatingCard
                key={player.player_id}
                player={{
                  id: player.player_id,
                  name: player.player_name,
                  surname: player.player_surname,
                  nickname: player.player_nickname,
                  avatarUrl: player.player_avatar,
                  jerseyNumber: player.jersey_number,
                }}
                currentRating={currentRating ? {
                  id: currentRating.id,
                  match_id: currentRating.match_id,
                  player_id: currentRating.player_id,
                  rating: currentRating.rating,
                  rating_decimal: currentRating.rating_decimal,
                  comment: currentRating.comment,
                  created_at: currentRating.created_at,
                  updated_at: currentRating.updated_at,
                } : localRating ? {
                  id: 'local',
                  match_id: matchId,
                  player_id: player.player_id,
                  rating: localRating.rating,
                  rating_decimal: 0,
                  comment: localRating.comment,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } : undefined}
                onRatingChange={(rating) => handleRatingChange(player.player_id, rating)}
                onCommentChange={(comment) => handleCommentChange(player.player_id, comment)}
                disabled={!canEdit}
                isPending={isPending}
              />
            )
          })}
        </div>
      )}

      {/* Read-only Mode: Ratings List */}
      {!canEdit && (
        <RatingsList ratings={allRatings} showAverage={true} />
      )}

      {/* Help Text (only in edit mode) */}
      {canEdit && (
        <Card className="mt-6 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3 text-muted-foreground">
              <Star className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p>{tRatings('helpText')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Read-only notice for completed matches */}
      {isCompleted && (
        <Card className="mt-6 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <p className="text-sm">
                {tRatings('completedReadonly')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not admin notice */}
      {!isAdmin && !isCompleted && (
        <Card className="mt-6 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <p className="text-sm">
                {tRatings('adminOnly')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// Skeleton Loader
// ============================================================================

export function MatchRatingsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="h-10 w-24 bg-muted rounded animate-pulse mb-4" />
      
      <Card className="mb-6">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-40 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
