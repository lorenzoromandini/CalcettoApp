'use client'

/**
 * Player Participation List Component
 * 
 * Displays players with toggle for played status.
 * Visual distinction for played vs not-played players.
 */

import { useTranslations } from 'next-intl'
import { Check, User, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MatchPlayerWithPlayer } from '@/lib/db/player-participation'

// ============================================================================
// Props
// ============================================================================

interface PlayerParticipationListProps {
  participants: MatchPlayerWithPlayer[]
  onTogglePlayed: (clubMemberId: string, currentPlayed: boolean) => void
  canEdit: boolean // isAdmin && match not completed
  isLoading?: boolean
}

// ============================================================================
// Player Card Component
// ============================================================================

interface PlayerCardProps {
  participant: MatchPlayerWithPlayer
  onToggle: () => void
  canEdit: boolean
}

function PlayerCard({ participant, onToggle, canEdit }: PlayerCardProps) {
  const t = useTranslations('matches')
  
  const displayName = participant.user?.nickname || 
    `${participant.user?.firstName || ''}${participant.user?.lastName ? ` ${participant.user.lastName}` : ''}`

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        participant.played
          ? 'bg-card border-primary/30 shadow-sm'
          : 'bg-muted/30 border-border opacity-75'
      )}
    >
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
        {participant.user?.image ? (
          <img
            src={participant.user.image}
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
          <p className={cn(
            'font-medium truncate',
            !participant.played && 'text-muted-foreground'
          )}>
            {displayName}
          </p>
          
          {/* Jersey Number Badge */}
          {participant.jerseyNumber > 0 && (
            <Badge 
              variant="outline" 
              className="text-xs h-5 px-1.5 font-mono shrink-0"
            >
              #{participant.jerseyNumber}
            </Badge>
          )}
        </div>
      </div>

      {/* Played Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            'text-xs font-medium',
            participant.played ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {participant.played ? t('participation.played') : t('participation.notPlayed')}
        </span>
        <Switch
          checked={participant.played}
          onCheckedChange={onToggle}
          disabled={!canEdit}
          aria-label={t('participation.toggleLabel', { name: displayName })}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PlayerParticipationList({
  participants,
  onTogglePlayed,
  canEdit,
  isLoading = false,
}: PlayerParticipationListProps) {
  const t = useTranslations('matches')

  // Calculate counts
  const playedCount = participants.filter(p => p.played).length
  const totalCount = participants.length

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('participation.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-6 w-11 bg-muted rounded-full animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('participation.title')}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {t('participation.countSummary', { played: playedCount, total: totalCount })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Player List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {t('participation.players')}
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary bg-green-100 text-green-700">
                {participants.length}
              </span>
            </h4>
            <span className="text-xs text-muted-foreground">
              {t('participation.playedCount', { count: playedCount, total: participants.length })}
            </span>
          </div>
          <div className="space-y-2">
            {participants.map((participant) => (
              <PlayerCard
                key={participant.id}
                participant={participant}
                onToggle={() => onTogglePlayed(participant.clubMemberId, participant.played)}
                canEdit={canEdit}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {participants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('participation.empty.title')}</p>
            <p className="text-sm">{t('participation.empty.description')}</p>
          </div>
        )}

        {/* Help Text */}
        {canEdit && participants.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {t('participation.helpText')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Skeleton Loader
// ============================================================================

export function PlayerParticipationListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3].map((group) => (
          <div key={group} className="space-y-3">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2].map((card) => (
                <div key={card} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-11 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
