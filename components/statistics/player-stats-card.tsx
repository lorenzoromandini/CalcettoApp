'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Target, Crosshair, Users, Trophy, X, Minus, Star, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MemberStats } from '@/lib/db/statistics'

interface PlayerStatsCardProps {
  stats: MemberStats
  showTitle?: boolean
  className?: string
}

/**
 * PlayerStatsCard - Displays comprehensive player statistics
 *
 * Shows all stats in a grid layout, with goalkeeper-specific
 * goals_conceded section when applicable.
 */
export function PlayerStatsCard({ stats, showTitle = true, className }: PlayerStatsCardProps) {
  const t = useTranslations('statistics')

  // Generate initials for placeholder
  const getInitials = () => {
    const first = stats.firstName?.charAt(0) || ''
    const last = stats.lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || stats.firstName?.charAt(0).toUpperCase() || '?'
  }

  const displayName = stats.nickname 
    ? `"${stats.nickname}"` 
    : `${stats.firstName}${stats.lastName ? ` ${stats.lastName}` : ''}`

  // Check if player is a goalkeeper with goals conceded data
  const isGoalkeeper = stats.goalsConceded !== null

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-3">
            {/* Player Avatar */}
            <div className="flex-shrink-0">
              {stats.image ? (
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={stats.image}
                    alt={stats.firstName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-lg font-bold text-primary/60">
                    {getInitials()}
                  </span>
                </div>
              )}
            </div>
            <span className="truncate">{displayName}</span>
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={showTitle ? 'pt-0' : 'pt-6'}>
        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Goals */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Target className="h-5 w-5 text-primary mb-1" />
            <span className="text-2xl font-bold">{stats.goals}</span>
            <span className="text-xs text-muted-foreground">{t('goals')}</span>
          </div>

          {/* Assists */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Crosshair className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-2xl font-bold">{stats.assists}</span>
            <span className="text-xs text-muted-foreground">{t('assists')}</span>
          </div>

          {/* Appearances */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Users className="h-5 w-5 text-gray-500 mb-1" />
            <span className="text-2xl font-bold">{stats.appearances}</span>
            <span className="text-xs text-muted-foreground">{t('appearances')}</span>
          </div>

          {/* Wins */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Trophy className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-2xl font-bold text-green-600">{stats.wins}</span>
            <span className="text-xs text-muted-foreground">{t('wins')}</span>
          </div>

          {/* Losses */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <X className="h-5 w-5 text-red-500 mb-1" />
            <span className="text-2xl font-bold text-red-600">{stats.losses}</span>
            <span className="text-xs text-muted-foreground">{t('losses')}</span>
          </div>

          {/* Draws */}
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Minus className="h-5 w-5 text-gray-400 mb-1" />
            <span className="text-2xl font-bold text-gray-500">{stats.draws}</span>
            <span className="text-xs text-muted-foreground">{t('draws')}</span>
          </div>
        </div>

        {/* Average Rating */}
        {stats.avgRating !== null && (
          <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="text-lg font-semibold">{t('avg_rating')}</span>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.avgRating.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({stats.totalRatings} {stats.totalRatings === 1 ? t('rating') : t('ratings')})
            </span>
          </div>
        )}

        {/* Goalkeeper Section - Only shown for GKs with goals conceded data */}
        {isGoalkeeper && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-6 w-6 text-blue-500" />
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {t('goals_conceded_as_gk')}
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.goalsConceded}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
