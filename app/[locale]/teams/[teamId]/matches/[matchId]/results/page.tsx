import { getMatch } from '@/lib/db/matches'
import { getMatchGoals } from '@/lib/db/goals'
import { getTeamPlayers } from '@/lib/db/players'
import { auth } from '@/lib/auth'
import { isTeamAdmin } from '@/lib/db/teams'
import { notFound, redirect } from 'next/navigation'
import { MatchResultsClient } from './match-results-client'
import type { Metadata } from 'next'

interface MatchResultsPageProps {
  params: Promise<{
    locale: string
    teamId: string
    matchId: string
  }>
}

export async function generateMetadata({ params }: MatchResultsPageProps): Promise<Metadata> {
  const { locale, teamId, matchId } = await params
  // Could fetch match title here
  return {
    title: 'Match Results',
  }
}

export default async function MatchResultsPage({ params }: MatchResultsPageProps) {
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

  // Check if match status allows viewing results
  // IN_PROGRESS, FINISHED, COMPLETED can view results
  if (match.status === 'SCHEDULED' || match.status === 'CANCELLED') {
    // Redirect to match detail page
    redirect(`/${locale}/teams/${teamId}/matches/${matchId}`)
  }

  // Fetch goals and players
  const [goals, players] = await Promise.all([
    getMatchGoals(matchId),
    getTeamPlayers(teamId),
  ])

  // Determine if editing is allowed
  const canEdit = isAdmin && match.status !== 'COMPLETED'

  return (
    <MatchResultsClient
      locale={locale}
      teamId={teamId}
      matchId={matchId}
      match={match}
      goals={goals}
      players={players}
      isAdmin={isAdmin}
      canEdit={canEdit}
    />
  )
}
