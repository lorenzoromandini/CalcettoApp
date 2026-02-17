'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Shirt, UserCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlayerStatsCard } from '@/components/statistics/player-stats-card'
import { usePlayerStats } from '@/hooks/use-statistics'
import type { Player } from '@/lib/db/schema'
import type { PlayerRole } from '@/lib/db/schema'

interface PlayerProfileClientProps {
  locale: string
  teamId: string
  playerId: string
  player: Player & { jersey_number?: number }
}

const ROLE_LABELS: Record<PlayerRole, string> = {
  goalkeeper: 'Portiere',
  defender: 'Difensore',
  midfielder: 'Centrocampista',
  attacker: 'Attaccante',
}

export function PlayerProfileClient({
  locale,
  teamId,
  playerId,
  player,
}: PlayerProfileClientProps) {
  const t = useTranslations('statistics')
  const tPlayers = useTranslations('players')
  const router = useRouter()
  const { stats, isLoading, error } = usePlayerStats(playerId, teamId)

  const handleBack = () => {
    router.push(`/${locale}/teams/${teamId}/players`)
  }

  // Get initials for avatar placeholder
  const getInitials = () => {
    const first = player.name?.charAt(0) || ''
    const last = player.surname?.charAt(0) || ''
    return (first + last).toUpperCase() || player.name?.charAt(0).toUpperCase() || '?'
  }

  // Get role label (use translations if available)
  const getRoleLabel = (role: PlayerRole) => {
    try {
      return tPlayers(`roles.${role}`)
    } catch {
      return ROLE_LABELS[role]
    }
  }

  // Display name
  const displayName = player.nickname 
    ? player.nickname 
    : `${player.name}${player.surname ? ` ${player.surname}` : ''}`

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back_to_roster')}
      </Button>

      {/* Player Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {player.avatar_url ? (
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20">
                  <Image
                    src={player.avatar_url}
                    alt={player.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-3xl font-bold text-primary/60">
                    {getInitials()}
                  </span>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">
                {player.name}{player.surname ? ` ${player.surname}` : ''}
              </h1>
              {player.nickname && (
                <p className="text-lg text-muted-foreground truncate">
                  &ldquo;{player.nickname}&rdquo;
                </p>
              )}

              {/* Jersey Number and Roles */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {player.jersey_number !== undefined && player.jersey_number > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <Shirt className="h-4 w-4" />
                    #{player.jersey_number}
                  </span>
                )}

                {player.roles.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-muted">
                    <UserCircle className="h-4 w-4" />
                    {getRoleLabel(player.roles[0])}
                  </span>
                )}
              </div>

              {/* Other Roles */}
              {player.roles.length > 1 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <span>{t('other_roles')}: </span>
                  {player.roles.slice(1).map((role, i) => (
                    <span key={role}>
                      {getRoleLabel(role)}
                      {i < player.roles.length - 2 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <h2 className="text-lg font-semibold mb-3">{t('player_statistics')}</h2>

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
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

      {stats && (
        <PlayerStatsCard stats={stats} showTitle={false} />
      )}

      {/* No Stats Yet */}
      {!isLoading && !error && !stats && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('no_stats_yet')}</h3>
            <p className="text-muted-foreground">{t('no_stats_description')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
