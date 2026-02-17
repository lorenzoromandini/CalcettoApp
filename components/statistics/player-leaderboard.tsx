'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Trophy, Medal, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PlayerLeaderboardEntry } from '@/lib/db/statistics'

interface PlayerLeaderboardProps {
  title: string
  entries: PlayerLeaderboardEntry[]
  valueLabel: string
  lowerIsBetter?: boolean  // For goals conceded
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

// Position badge colors
const POSITION_STYLES = {
  1: {
    bg: 'bg-amber-100 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-400',
  },
  2: {
    bg: 'bg-slate-100 dark:bg-slate-950/30',
    border: 'border-slate-300 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
  },
  3: {
    bg: 'bg-orange-100 dark:bg-orange-950/30',
    border: 'border-orange-300 dark:border-orange-700',
    text: 'text-orange-700 dark:text-orange-400',
  },
} as const

/**
 * PlayerLeaderboard - Displays top 3 players with medal badges
 *
 * Shows position, player avatar, name, and value.
 * Supports lowerIsBetter for goals conceded leaderboard.
 */
export function PlayerLeaderboard({
  title,
  entries,
  valueLabel,
  lowerIsBetter = false,
  isLoading = false,
  emptyMessage,
  className,
}: PlayerLeaderboardProps) {
  const t = useTranslations('statistics')

  // Generate initials for placeholder
  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || '?'
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-5 w-8 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground text-sm">
            {emptyMessage || t('no_data')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry, index) => {
          const position = index + 1
          const style = POSITION_STYLES[position as keyof typeof POSITION_STYLES]
          const isLowerBetterValue = lowerIsBetter && entry.value < 3

          return (
            <div
              key={entry.player_id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Position Badge */}
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border ${style.bg} ${style.border}`}
              >
                {position === 1 ? (
                  <Trophy className={`h-4 w-4 ${style.text}`} />
                ) : (
                  <Medal className={`h-4 w-4 ${style.text}`} />
                )}
              </div>

              {/* Player Avatar */}
              <div className="flex-shrink-0">
                {entry.player_avatar ? (
                  <div className="relative h-9 w-9 rounded-full overflow-hidden">
                    <Image
                      src={entry.player_avatar}
                      alt={entry.player_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="h-4 w-4 text-primary/60" />
                  </div>
                )}
              </div>

              {/* Player Name */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {entry.player_nickname || entry.player_name}
                </div>
                {entry.player_nickname && (
                  <div className="text-xs text-muted-foreground truncate">
                    {entry.player_name}
                  </div>
                )}
              </div>

              {/* Value */}
              <div
                className={`flex-shrink-0 font-bold ${
                  isLowerBetterValue
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-foreground'
                }`}
              >
                {typeof entry.value === 'number' && entry.value % 1 !== 0
                  ? entry.value.toFixed(2)
                  : entry.value}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
