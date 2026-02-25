'use client'

/**
 * Player Participation List Component
 * 
 * Displays all RSVP'd players with toggle for played status.
 * Grouped by RSVP status (IN first, then MAYBE, then OUT).
 * Visual distinction for played vs not-played players.
 */

import { useTranslations } from 'next-intl'
import { Check, X, HelpCircle, User, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MatchPlayerWithPlayer } from '@/lib/db/player-participation'
import type { RSVPStatus } from '@/lib/db/schema'

// ============================================================================
// Props
// ============================================================================

interface PlayerParticipationListProps {
  participants: MatchPlayerWithPlayer[]
  onTogglePlayed: (playerId: string, currentPlayed: boolean) => void
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
  
  const displayName = participant.clubMember.user.nickname || 
    `${participant.clubMember.user.firstName}${participant.clubMember.user.lastName ? ` ${participant.clubMember.user.lastName}` : ''}`

  const getRSVPIcon = () => {
    switch (participant.rsvpStatus) {
      case 'in':
        return <Check className="h-3 w-3" />
      case 'out':
        return <X className="h-3 w-3" />
      case 'maybe':
        return <HelpCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const getRSVPColor = () => {
    switch (participant.rsvpStatus) {
      case 'in':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'out':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'maybe':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

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
        {participant.clubMember.user.image ? (
          <img
            src={participant.clubMember.user.image}
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

        {/* RSVP Badge */}
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className={cn(
              'shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] font-medium',
              getRSVPColor()
            )}
          >
            {getRSVPIcon()}
            <span>
              {participant.rsvpStatus === 'in' && t('rsvp.in')}
              {participant.rsvpStatus === 'out' && t('rsvp.out')}
              {participant.rsvpStatus === 'maybe' && t('rsvp.maybe')}
            </span>
          </span>
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
// RSVP Group Component
// ============================================================================

interface RSVPGroupProps {
  title: string
  status: RSVPStatus
  participants: MatchPlayerWithPlayer[]
  onTogglePlayed: (playerId: string, currentPlayed: boolean) => void
  canEdit: boolean
  icon: React.ReactNode
  badgeColor: string
}

function RSVPGroup({
  title,
  status,
  participants,
  onTogglePlayed,
  canEdit,
  icon,
  badgeColor,
}: RSVPGroupProps) {
  const t = useTranslations('matches')

  if (participants.length === 0) {
    return null
  }

  const playedCount = participants.filter(p => p.played).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
          <span className={cn('text-xs px-2 py-0.5 rounded-full bg-secondary', badgeColor)}>
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
            onToggle={() => onTogglePlayed(participant.playerId, participant.played)}
            canEdit={canEdit}
          />
        ))}
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

  // Group by RSVP status
  const inParticipants = participants.filter(p => p.rsvpStatus === 'in')
  const maybeParticipants = participants.filter(p => p.rsvpStatus === 'maybe')
  const outParticipants = participants.filter(p => p.rsvpStatus === 'out')

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
        {/* IN Group */}
        <RSVPGroup
          title={t('participation.groups.in')}
          status="in"
          participants={inParticipants}
          onTogglePlayed={onTogglePlayed}
          canEdit={canEdit}
          icon={<Check className="h-4 w-4 text-green-500" />}
          badgeColor="bg-green-100 text-green-700"
        />

        {inParticipants.length > 0 && (maybeParticipants.length > 0 || outParticipants.length > 0) && (
          <div className="h-px bg-border" />
        )}

        {/* MAYBE Group */}
        <RSVPGroup
          title={t('participation.groups.maybe')}
          status="maybe"
          participants={maybeParticipants}
          onTogglePlayed={onTogglePlayed}
          canEdit={canEdit}
          icon={<HelpCircle className="h-4 w-4 text-yellow-500" />}
          badgeColor="bg-yellow-100 text-yellow-700"
        />

        {maybeParticipants.length > 0 && outParticipants.length > 0 && (
          <div className="h-px bg-border" />
        )}

        {/* OUT Group */}
        <RSVPGroup
          title={t('participation.groups.out')}
          status="out"
          participants={outParticipants}
          onTogglePlayed={onTogglePlayed}
          canEdit={canEdit}
          icon={<X className="h-4 w-4 text-red-500" />}
          badgeColor="bg-red-100 text-red-700"
        />

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
