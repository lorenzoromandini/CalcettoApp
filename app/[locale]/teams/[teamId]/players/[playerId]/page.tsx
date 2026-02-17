import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPlayerWithTeamInfo } from '@/lib/db/players'
import { PlayerProfileClient } from './player-profile-client'

interface PlayerProfilePageProps {
  params: Promise<{
    locale: string
    teamId: string
    playerId: string
  }>
}

export async function generateMetadata({
  params,
}: PlayerProfilePageProps): Promise<Metadata> {
  const { locale, teamId, playerId } = await params
  const t = await getTranslations({ locale, namespace: 'statistics' })

  // Get player info for dynamic title
  const player = await getPlayerWithTeamInfo(playerId, teamId)
  const playerName = player?.nickname || player?.name || t('player_profile')

  return {
    title: playerName,
    description: t('player_profile_description', { name: playerName }),
  }
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { locale, teamId, playerId } = await params

  // Get player info for server-side rendering
  const player = await getPlayerWithTeamInfo(playerId, teamId)

  if (!player) {
    notFound()
  }

  return (
    <PlayerProfileClient
      locale={locale}
      teamId={teamId}
      playerId={playerId}
      player={player}
    />
  )
}
