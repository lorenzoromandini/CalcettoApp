'use client'

/**
 * Match History Page Client
 * 
 * Page showing all completed matches for a club:
 * - List of completed matches, sorted by date (most recent first)
 * - Filter by result (wins, losses, draws) - optional enhancement
 * - Click card to view full details
 * - Empty state if no completed matches
 */

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Trophy, Filter, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MatchHistoryCard, MatchHistoryCardSkeleton, type MatchHistoryData } from '@/components/matches/match-history-card'
import { getClubMatches } from '@/lib/db/matches'
import { getMatchGoals, type GoalWithPlayers } from '@/lib/db/goals'
import { getMatchRatings, type PlayerRatingWithPlayer } from '@/lib/db/player-ratings'
import { getFormation } from '@/lib/db/formations'
import { isTeamAdmin } from '@/lib/db/clubs'
import { useSession } from '@/components/providers/session-provider'
import type { Match } from '@/lib/db/schema'

// ============================================================================
// Types
// ============================================================================

type ResultFilter = 'all' | 'win' | 'loss' | 'draw'

interface MatchHistoryPageClientProps {
  locale: string
  clubId: string
}

// ============================================================================
// Component
// ============================================================================

export function MatchHistoryPageClient({ locale, clubId }: MatchHistoryPageClientProps) {
  const t = useTranslations('history')
  const tMatches = useTranslations('matches')
  const router = useRouter()
  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(true)
  const [matches, setMatches] = useState<Match[]>([])
  const [matchData, setMatchData] = useState<Map<string, MatchHistoryData>>(new Map())
  const [isAdmin, setIsAdmin] = useState(false)
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all')

  // Load matches and check admin status
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Check admin status
        if (session?.user?.id) {
          const admin = await isTeamAdmin(clubId, session.user.id)
          setIsAdmin(admin)
        }

        // Get all team matches
        const allMatches = await getClubMatches(clubId)
        
        // Filter to only completed matches
        const completedMatches = allMatches.filter(m => m.status === 'COMPLETED')
        setMatches(completedMatches)

        // Load goals, ratings, and formation for each match
        const dataMap = new Map<string, MatchHistoryData>()
        
        for (const match of completedMatches) {
          const [goals, ratings, formation] = await Promise.all([
            getMatchGoals(match.id),
            getMatchRatings(match.id),
            getFormation(match.id),
          ])

          dataMap.set(match.id, {
            match,
            goals,
            ratings,
            formation,
          })
        }

        setMatchData(dataMap)
      } catch (error) {
        console.error('Failed to load match history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [clubId, session?.user?.id])

  // Filter matches by result
  const filteredMatches = useMemo(() => {
    if (resultFilter === 'all') return matches

    return matches.filter(match => {
      const homeScore = match.home_score ?? 0
      const awayScore = match.away_score ?? 0

      if (resultFilter === 'win') return homeScore > awayScore
      if (resultFilter === 'loss') return homeScore < awayScore
      if (resultFilter === 'draw') return homeScore === awayScore
      return true
    })
  }, [matches, resultFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const wins = matches.filter(m => (m.home_score ?? 0) > (m.away_score ?? 0)).length
    const losses = matches.filter(m => (m.home_score ?? 0) < (m.away_score ?? 0)).length
    const draws = matches.filter(m => (m.home_score ?? 0) === (m.away_score ?? 0)).length
    const totalGoals = matches.reduce((sum, m) => sum + (m.home_score ?? 0), 0)

    return { wins, losses, draws, totalGoals, total: matches.length }
  }, [matches])

  const handleBack = () => {
    router.push(`/${locale}/clubs/${clubId}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back')}
      </Button>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>

        {/* Result Filter */}
        <Select
          value={resultFilter}
          onValueChange={(value) => setResultFilter(value as ResultFilter)}
        >
          <SelectTrigger className="w-[130px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterAll')}</SelectItem>
            <SelectItem value="win">{t('win')}</SelectItem>
            <SelectItem value="loss">{t('loss')}</SelectItem>
            <SelectItem value="draw">{t('draw')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary */}
      {!isLoading && matches.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('totalMatches')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
                <p className="text-xs text-muted-foreground">{t('wins')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.losses}</p>
                <p className="text-xs text-muted-foreground">{t('losses')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalGoals}</p>
                <p className="text-xs text-muted-foreground">{t('goalsScored')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <MatchHistoryCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            {resultFilter === 'all' ? (
              <>
                <h3 className="text-lg font-medium mb-2">{t('noMatches')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('noMatchesDescription')}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">{t('noFilteredMatches')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('noFilteredMatchesDescription')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setResultFilter('all')}
                >
                  {t('clearFilter')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const data = matchData.get(match.id)
            if (!data) return null

            return (
              <MatchHistoryCard
                key={match.id}
                data={data}
                clubId={clubId}
                locale={locale}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
