'use client'

/**
 * CompletedMatchDetail Component
 * 
 * Read-only view of a completed match with all details:
 * 1. Header: Date, location, final score, result (W/L/D)
 * 2. Scorers: List of goals with scorer, assist, own-goal badge
 * 3. Formation: Visual pitch display (if exists)
 * 4. Player Ratings: All ratings sorted by score, with average
 * 5. Player Comments: Comments from ratings
 * 
 * All read-only, no edit buttons.
 */

import { useTranslations } from 'next-intl'
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  Star, 
  Users, 
  LayoutGrid,
  MessageSquare,
  Target,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Match } from '@/lib/db/schema'
import type { GoalWithMembers, GoalWithPlayers } from '@/lib/db/goals'
import type { PlayerRatingWithPlayer } from '@/lib/db/player-ratings'
import { calculateAverageRating, formatAverageRating } from '@/lib/rating-utils'

// ============================================================================
// Types
// ============================================================================

export interface CompletedMatchData {
  match: Match
  goals: GoalWithPlayers[]
  ratings: PlayerRatingWithPlayer[]
  formation?: {
    formation: string
    positions: Array<{ 
      x: number
      y: number
      label: string
      playerId?: string
    }>
  } | null
  players: Array<{
    id: string
    name: string
    surname?: string
    nickname?: string
    avatarUrl?: string
    jerseyNumber?: number
    played: boolean
  }>
}

interface CompletedMatchDetailProps {
  data: CompletedMatchData
  clubId: string
  locale: string
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

function getResult(match: Match): 'win' | 'loss' | 'draw' {
  const homeScore = match.homeScore ?? 0
  const awayScore = match.awayScore ?? 0

  if (homeScore > awayScore) return 'win'
  if (homeScore < awayScore) return 'loss'
  return 'draw'
}

function getPlayerDisplayName(
  name: string, 
  surname?: string | null, 
  nickname?: string | null
): string {
  if (nickname) return nickname
  if (surname) return `${name} ${surname}`
  return name
}

function getPlayerInitials(name: string, surname?: string | null): string {
  if (surname) {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}

// ============================================================================
// Component
// ============================================================================

export function CompletedMatchDetail({ 
  data, 
  clubId, 
  locale 
}: CompletedMatchDetailProps) {
  const t = useTranslations('history')
  const tMatches = useTranslations('matches')
  const tGoals = useTranslations('goals')

  const { match, goals, ratings, formation, players } = data
  
  const result = getResult(match)
  const homeScore = match.homeScore ?? 0
  const awayScore = match.awayScore ?? 0

  // Calculate average rating
  const decimals = ratings.map(r => r.ratingDecimal)
  const averageRating = calculateAverageRating(decimals)

  // All goals in the match (no filtering by team since teams change per match)
  const allGoals = goals
  const ownGoals = goals.filter(g => g.isOwnGoal)

  // Result styles
  const resultConfig = {
    win: { label: t('win'), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500' },
    loss: { label: t('loss'), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' },
    draw: { label: t('draw'), color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-500' },
  }

  const resultStyle = resultConfig[result]

  // Players with comments
  const playersWithComments = ratings.filter(r => r.comment)

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Date and Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {formatDateFull(match.scheduledAt, locale)}
                </span>
              </div>
              
              {match.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{match.location}</span>
                </div>
              )}
            </div>

            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {tMatches('mode.5vs5' in tMessages ? 'mode.5vs5' : 'mode.5vs5')}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold">{homeScore}</span>
                  <span className="text-2xl text-muted-foreground">-</span>
                  <span className="text-4xl font-bold">{awayScore}</span>
                </div>
              </div>
            </div>

            {/* Result Badge */}
            <Badge className={cn('text-white text-lg px-4 py-2', resultStyle.bg)}>
              {resultStyle.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {tGoals('title')}
            <Badge variant="secondary" className="ml-auto">
              {goals.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{tGoals('empty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal, index) => {
                // No team-based filtering - just show all goals
                const isNotOwnGoal = !goal.isOwnGoal
                
                return (
                  <div 
                    key={goal.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border',
                      goal.isOwnGoal && 'border-red-500/50 bg-red-50/10 dark:bg-red-950/10'
                    )}
                  >
                    {/* Goal Number */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>

                    {/* Scorer */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={goal.scorer.user.image ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getPlayerInitials(goal.scorer.user.firstName, goal.scorer.user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {getPlayerDisplayName(
                            goal.scorer.user.firstName,
                            goal.scorer.user.lastName,
                            goal.scorer.user.nickname
                          )}
                        </span>
                        
                        {goal.isOwnGoal && (
                          <Badge variant="destructive" className="text-xs">
                            {tGoals('ownGoal')}
                          </Badge>
                        )}
                        
                        <Badge 
                          variant="default" 
                          className="text-xs"
                        >
                          {tGoals('goal')}
                        </Badge>
                      </div>

                      {/* Assist */}
                      {goal.assister && !goal.isOwnGoal && (
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <span className="text-xs">{tGoals('assist')}</span>
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={goal.assister.user.image ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                              {getPlayerInitials(goal.assister.user.firstName, goal.assister.user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">
                            {getPlayerDisplayName(
                              goal.assister.user.firstName,
                              goal.assister.user.lastName,
                              goal.assister.user.nickname
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formation Section */}
      {formation && formation.positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              {tMatches('detail.sections.formation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Pitch Display */}
              <div className="relative aspect-[3/4] max-w-[250px] mx-auto md:mx-0 bg-green-800 rounded-lg overflow-hidden flex-1">
                {/* Pitch markings */}
                <div className="absolute inset-0 border-2 border-white/30" />
                <div className="absolute top-0 left-1/4 right-1/4 h-[15%] border-b-2 border-x-2 border-white/30" />
                <div className="absolute bottom-0 left-1/4 right-1/4 h-[15%] border-t-2 border-x-2 border-white/30" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
                <div className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 rounded-full" />

                {/* Player dots */}
                {formation.positions.filter(p => p.playerId).map((pos, idx) => {
                  const player = players.find(p => p.id === pos.playerId)
                  
                  return (
                    <div
                      key={idx}
                      className="absolute flex items-center justify-center"
                      style={{
                        left: `${(pos.x / 9) * 100}%`,
                        top: `${(pos.y / 7) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="w-8 h-8 bg-white rounded-full border-2 border-primary shadow-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-green-800">
                          {player?.jerseyNumber || ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Player List */}
              <div className="flex-1">
                <div className="space-y-2">
                  {formation.positions
                    .filter(p => p.playerId)
                    .map((pos, idx) => {
                      const player = players.find(p => p.id === pos.playerId)
                      if (!player) return null

                      return (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={player.avatarUrl} />
                            <AvatarFallback className="text-xs">
                              {getPlayerInitials(player.name, player.surname)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {getPlayerDisplayName(player.name, player.surname, player.nickname)}
                          </span>
                          {player.jerseyNumber && (
                            <Badge variant="outline" className="text-xs ml-auto">
                              #{player.jerseyNumber}
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ratings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {tMatches('ratings.title' in tRatings ? 'ratings.title' : 'detail.sections.stats')}
            <Badge variant="secondary" className="ml-auto">
              {ratings.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Average Rating */}
          {averageRating !== null && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t('averageRating')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {formatAverageRating(averageRating)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({ratings.length} {ratings.length === 1 ? t('player') : t('players')})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ratings List */}
          {ratings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('noRatings')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ratings.map((rating, index) => {
                // Get medal for top 3
                const getMedal = () => {
                  if (index === 0) return '🥇'
                  if (index === 1) return '🥈'
                  if (index === 2) return '🥉'
                  return null
                }

                return (
                  <div 
                    key={rating.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    {/* Rank */}
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 font-medium text-sm">
                      {getMedal() || index + 1}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={rating.image} />
                      <AvatarFallback>
                        {getPlayerInitials(rating.firstName, rating.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {getPlayerDisplayName(
                            rating.firstName,
                            rating.lastName,
                            rating.nickname
                          )}
                        </p>
                        {rating.jerseyNumber > 0 && (
                          <Badge variant="outline" className="text-xs font-mono shrink-0">
                            #{rating.jerseyNumber}
                          </Badge>
                        )}
                      </div>
                      
                      {rating.comment && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {rating.comment}
                        </p>
                      )}
                    </div>

                    {/* Rating */}
                    <Badge className="shrink-0 text-base px-3 py-1">
                      {rating.rating}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section (if any) */}
      {playersWithComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('comments')}
              <Badge variant="secondary" className="ml-auto">
                {playersWithComments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {playersWithComments.map((rating) => (
                <div key={rating.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={rating.image} />
                    <AvatarFallback>
                      {getPlayerInitials(rating.firstName, rating.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {getPlayerDisplayName(
                          rating.firstName,
                          rating.lastName,
                          rating.nickname
                        )}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {rating.rating}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rating.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Reference for translation keys
const tMessages = { 'mode.5vs5': '5 vs 5' }
const tRatings = { 'ratings.title': 'Match Ratings' }
