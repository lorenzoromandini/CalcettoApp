'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlayerLeaderboard } from '@/components/statistics/player-leaderboard'
import { useClubLeaderboards } from '@/hooks/use-statistics'
import { useClub } from '@/hooks/use-clubs'

interface StatsPageClientProps {
  locale: string
  clubId: string
}

export function StatsPageClient({ locale, clubId }: StatsPageClientProps) {
  const t = useTranslations('statistics')
  const clubsT = useTranslations('clubs')
  const router = useRouter()
  const { club } = useClub(clubId)
  const { leaderboards, isLoading, error } = useClubLeaderboards(clubId)



  const handleBack = () => {
    router.push(`/clubs/${clubId}`)
  }

  // Check if there's any data
  const hasAnyData = Object.values(leaderboards).some(arr => arr.length > 0)

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {clubsT('back')}
      </Button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        {club && (
          <p className="text-muted-foreground">{club.name}</p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.refresh()}
            >
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && !hasAnyData && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('no_stats_yet')}</h3>
            <p className="text-muted-foreground">{t('no_club_stats_description')}</p>
          </CardContent>
        </Card>
      )}

      {/* Leaderboards Grid */}
      {!isLoading && !error && hasAnyData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Top Scorers */}
          <PlayerLeaderboard
            title={t('top_scorers')}
            entries={leaderboards.scorers}
            valueLabel={t('goals')}
            emptyMessage={t('no_data')}
          />

          {/* Top Assists */}
          <PlayerLeaderboard
            title={t('top_assists')}
            entries={leaderboards.assisters}
            valueLabel={t('assists')}
            emptyMessage={t('no_data')}
          />

          {/* Top Appearances */}
          <PlayerLeaderboard
            title={t('top_appearances')}
            entries={leaderboards.appearances}
            valueLabel={t('appearances')}
            emptyMessage={t('no_data')}
          />

          {/* Top Wins */}
          <PlayerLeaderboard
            title={t('top_wins')}
            entries={leaderboards.wins}
            valueLabel={t('wins')}
            emptyMessage={t('no_data')}
          />

          {/* Top Losses */}
          <PlayerLeaderboard
            title={t('top_losses')}
            entries={leaderboards.losses}
            valueLabel={t('losses')}
            emptyMessage={t('no_data')}
          />

          {/* Top MVP (Average Rating) */}
          <PlayerLeaderboard
            title={t('top_rated')}
            entries={leaderboards.rated}
            valueLabel={t('avg_rating')}
            emptyMessage={t('no_data')}
          />

          {/* Best Goalkeeper (Fewest Goals Conceded) */}
          <PlayerLeaderboard
            title={t('best_goalkeeper')}
            entries={leaderboards.goalsConceded}
            valueLabel={t('goals_conceded')}
            lowerIsBetter={true}
            emptyMessage={t('no_goalkeeper_data')}
          />
        </div>
      )}
    </div>
  )
}
