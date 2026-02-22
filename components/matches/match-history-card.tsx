'use client'

/**
 * MatchHistoryCard Component
 * 
 * A card for displaying a completed match in the history view.
 * Shows:
 * - Date and opponent/location
 * - Final score (homeScore - awayScore)
 * - Top scorer(s) with goal count
 * - Best rated player (MVP)
 * - Link to full details
 * 
 * Color coding:
 * - Green accent: Win
 * - Red accent: Loss
 * - Gray accent: Draw
 */

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Calendar, MapPin, Trophy, Star, ChevronRight, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Match } from '@/lib/db/schema'
import type { GoalWithPlayers } from '@/lib/db/goals'
import type { PlayerRatingWithPlayer } from '@/lib/db/player-ratings'

// ============================================================================
// Types
// ============================================================================

export interface MatchHistoryData {
  match: Match
  goals: GoalWithPlayers[]
  ratings: PlayerRatingWithPlayer[]
  formation?: {
    formation: string
    positions: Array<{ x: number; y: number; label: string; playerId?: string }>
  } | null
}

interface MatchHistoryCardProps {
  data: MatchHistoryData
  clubId: string
  locale: string
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getResult(match: Match): 'win' | 'loss' | 'draw' {
  const homeScore = match.home_score ?? 0
  const awayScore = match.away_score ?? 0

  if (homeScore > awayScore) return 'win'
  if (homeScore < awayScore) return 'loss'
  return 'draw'
}

function getScorers(
  goals: GoalWithPlayers[], 
  clubId: string,
  maxDisplay: number = 3
): { scorers: Array<{ name: string; count: number }>; extra: number } {
  // Filter goals for our team (not opponent goals, not own goals)
  const ourGoals = goals.filter(g => g.clubId === clubId && !g.isOwnGoal)

  if (ourGoals.length === 0) return { scorers: [], extra: 0 }

  // Count goals per player
  const scorerMap = new Map<string, { name: string; count: number }>()
  
  for (const goal of ourGoals) {
    const playerId = goal.scorer.id
    const existing = scorerMap.get(playerId)
    
    if (existing) {
      existing.count++
    } else {
      scorerMap.set(playerId, {
        name: goal.scorer.nickname || 
          `${goal.scorer.name}${goal.scorer.surname ? ` ${goal.scorer.surname}` : ''}`,
        count: 1,
      })
    }
  }

  // Sort by count (descending) and take top scorers
  const sortedScorers = Array.from(scorerMap.values())
    .sort((a, b) => b.count - a.count)
  
  const displayedScorers = sortedScorers.slice(0, maxDisplay)
  const extra = sortedScorers.length - maxDisplay

  return { scorers: displayedScorers, extra: extra > 0 ? extra : 0 }
}

function getBestRated(ratings: PlayerRatingWithPlayer[]): { name: string; rating: string } | null {
  if (ratings.length === 0) return null

  // Ratings are already sorted by rating descending (best first)
  const best = ratings[0]
  
  return {
    name: best.player_nickname || 
      `${best.player_name}${best.player_surname ? ` ${best.player_surname}` : ''}`,
    rating: best.rating,
  }
}

// ============================================================================
// Component
// ============================================================================

export function MatchHistoryCard({ data, clubId, locale }: MatchHistoryCardProps) {
  const t = useTranslations('history')
  const tStats = useTranslations('statistics')
  const tMatches = useTranslations('matches')

  const { match, goals, ratings } = data
  
  const result = getResult(match)
  const homeScore = match.home_score ?? 0
  const awayScore = match.away_score ?? 0
  const { scorers, extra } = getScorers(goals, clubId)
  const bestRated = getBestRated(ratings)

  // Color coding based on result
  const resultStyles = {
    win: {
      border: 'border-l-green-500',
      bg: 'bg-green-50/50 dark:bg-green-950/20',
      badge: 'bg-green-500 hover:bg-green-600',
      text: 'text-green-700 dark:text-green-400',
    },
    loss: {
      border: 'border-l-red-500',
      bg: 'bg-red-50/50 dark:bg-red-950/20',
      badge: 'bg-red-500 hover:bg-red-600',
      text: 'text-red-700 dark:text-red-400',
    },
    draw: {
      border: 'border-l-gray-400',
      bg: 'bg-gray-50/50 dark:bg-gray-950/20',
      badge: 'bg-gray-500 hover:bg-gray-600',
      text: 'text-gray-700 dark:text-gray-400',
    },
  }

  const styles = resultStyles[result]

  return (
    <Link href={`/${locale}/teams/${clubId}/matches/${match.id}`}>
      <Card className={cn(
        'cursor-pointer transition-all hover:shadow-md active:scale-[0.98] border-l-4',
        styles.border,
        styles.bg,
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Date Box */}
            <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-medium text-center leading-tight">
                {new Date(match.scheduled_at).toLocaleDateString(
                  locale === 'it' ? 'it-IT' : 'en-US',
                  { day: 'numeric', month: 'short' }
                )}
              </span>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Result Badge */}
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn('text-white', styles.badge)}>
                  {t(result)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {match.mode === '5vs5' ? '5v5' : '8v8'}
                </Badge>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('text-2xl font-bold', styles.text)}>
                  {homeScore} - {awayScore}
                </span>
              </div>

              {/* Location */}
              {match.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{match.location}</span>
                </p>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap gap-3 text-sm">
                {/* Scorers */}
                {scorers.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">
                      {scorers.map((s, i) => (
                        <span key={i}>
                          {s.name} ({s.count}){i < scorers.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                      {extra > 0 && (
                        <span className="text-muted-foreground/70"> +{extra}</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Best Rated (MVP) */}
                {bestRated && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">{bestRated.name}</span>
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {bestRated.rating}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ============================================================================
// Skeleton Loader
// ============================================================================

export function MatchHistoryCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-muted">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted rounded animate-pulse" />
              <div className="h-5 w-10 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
