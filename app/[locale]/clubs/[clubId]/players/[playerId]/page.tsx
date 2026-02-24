import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPlayerWithClubInfo } from '@/lib/db/players'
import { PlayerProfileClient } from './player-profile-client'

interface PlayerProfilePageProps {
  params: Promise<{
    locale: string
    clubId: string
    playerId: string
  }>
}

export async function generateMetadata({
  params,
}: PlayerProfilePageProps): Promise<Metadata> {
  const { locale, clubId, playerId } = await params
  const t = await getTranslations({ locale, namespace: 'statistics' })

  // Get player info for dynamic title
  const player = await getPlayerWithClubInfo(playerId, clubId)
  const playerName = player?.nickname || player?.name || t('player_profile')

  return {
    title: playerName,
    description: t('player_profile_description', { name: playerName }),
  }
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { locale, clubId, playerId } = await params

  // Get player info for server-side rendering
  const player = await getPlayerWithClubInfo(playerId, clubId)

  if (!player) {
    notFound()
  }

  return (
    <PlayerProfileClient
      locale={locale}
      clubId={clubId}
      playerId={playerId}
      player={player}
    />
  )
}
