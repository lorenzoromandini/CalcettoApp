'use client'

/**
 * Match Results Client Component
 * 
 * Displays match results with:
 * - Current score (home/away)
 * - Goal list with add/remove
 * - Add Goal button opens GoalForm
 * - Score calculated from goals
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, Users, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { GoalList } from '@/components/matches/goal-list'
import { GoalForm } from '@/components/matches/goal-form'
import { MatchStatusBadge } from '@/components/matches/match-status-badge'
import { useGoals } from '@/hooks/use-goals'
import type { Match, Player } from '@/lib/db/schema'
import type { GoalWithPlayers } from '@/lib/db/goals'

// ============================================================================
// Component Props
// ============================================================================

interface MatchResultsClientProps {
  locale: string
  teamId: string
  matchId: string
  match: Match
  goals: GoalWithPlayers[]
  players: (Player & { jersey_number?: number; player_team_id?: string })[]
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

export function MatchResultsClient({
  locale,
  teamId,
  matchId,
  match,
  goals: initialGoals,
  players,
  isAdmin,
  canEdit,
}: MatchResultsClientProps) {
  const t = useTranslations('matches')
  const tGoals = useTranslations('goals')
  const router = useRouter()
  
  // Goal state
  const { goals, isLoading, addGoal, removeGoal } = useGoals(matchId)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Calculate scores from goals
  const homeGoals = goals.filter(g => g.teamId === teamId && !g.isOwnGoal)
  const awayGoals = goals.filter(g => g.teamId !== teamId && !g.isOwnGoal)
  const ownGoalsForAway = goals.filter(g => g.teamId === teamId && g.isOwnGoal)
  const ownGoalsForHome = goals.filter(g => g.teamId !== teamId && g.isOwnGoal)
  
  const homeScore = homeGoals.length + ownGoalsForHome.length
  const awayScore = awayGoals.length + ownGoalsForAway.length

  const handleBack = () => {
    router.push(`/${locale}/teams/${teamId}/matches/${matchId}`)
  }

  const isCompleted = match.status === 'COMPLETED'

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

      {/* Score Display */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-6">
            {/* Home Team */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">{tGoals('ourTeam')}</span>
              </div>
              <div className="text-5xl font-bold">{homeScore}</div>
            </div>

            {/* Divider */}
            <div className="text-3xl font-light text-muted-foreground">-</div>

            {/* Away Team */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{tGoals('opponent')}</span>
              </div>
              <div className="text-5xl font-bold">{awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {tGoals('title')}
              <Badge variant="secondary">{goals.length}</Badge>
            </CardTitle>
            
            {/* Add Goal Button */}
            {canEdit && (
              <GoalForm
                matchId={matchId}
                teamId={teamId}
                players={players}
                onAddGoal={addGoal}
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                isLoading={isLoading}
              />
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {isCompleted && !isAdmin && (
            <p className="text-sm text-muted-foreground mb-4">
              {tGoals('completedNote')}
            </p>
          )}
          
          <GoalList
            goals={goals}
            teamId={teamId}
            canEdit={canEdit}
            onRemoveGoal={removeGoal}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Read-only notice for completed matches */}
      {isCompleted && (
        <Card className="mt-6 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <p className="text-sm">
                {tGoals('completedMatchReadonly')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
