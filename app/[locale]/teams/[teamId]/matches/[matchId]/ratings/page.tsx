import { getMatch } from '@/lib/db/matches'
import { getMatchParticipants } from '@/lib/db/player-participation'
import { getMatchRatings } from '@/lib/db/player-ratings'
import { auth } from '@/lib/auth'
import { isTeamAdmin } from '@/lib/db/teams'
import { notFound, redirect } from 'next/navigation'
import { MatchRatingsClient } from './match-ratings-client'
import type { Metadata } from 'next'

interface MatchRatingsPageProps {
  params: Promise<{
    locale: string
    teamId: string
    matchId: string
  }>
}

export async function generateMetadata({ params }: MatchRatingsPageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'it' ? 'Voti Partita' : 'Match Ratings',
  }
}

export default async function MatchRatingsPage({ params }: MatchRatingsPageProps) {
  const { locale, teamId, matchId } = await params
  
  // Get session
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/auth/login`)
  }

  // Check admin status
  const isAdmin = await isTeamAdmin(teamId, session.user.id)

  // Fetch match data
  const match = await getMatch(matchId)
  if (!match) {
    notFound()
  }

  // Ratings only available for FINISHED or COMPLETED matches
  if (match.status === 'SCHEDULED' || match.status === 'IN_PROGRESS' || match.status === 'CANCELLED') {
    redirect(`/${locale}/teams/${teamId}/matches/${matchId}`)
  }

  // Fetch participants (only played players) and existing ratings
  const [participants, ratings] = await Promise.all([
    getMatchParticipants(matchId),
    getMatchRatings(matchId),
  ])

  // Filter to only players who played
  const playedPlayers = participants.filter(p => p.played)

  // Determine if editing is allowed
  // Only FINISHED matches can be edited, not COMPLETED
  const canEdit = isAdmin && match.status === 'FINISHED'

  return (
    <MatchRatingsClient
      locale={locale}
      teamId={teamId}
      matchId={matchId}
      match={match}
      playedPlayers={playedPlayers}
      initialRatings={ratings}
      isAdmin={isAdmin}
      canEdit={canEdit}
    />
  )
}
