import { getMatch } from '@/lib/db/matches'
import { getMatchGoals } from '@/lib/db/goals'
import { getClubMembers } from '@/lib/db/clubs'
import { getUserIdFromHeaders } from '@/lib/auth-headers'
import { isClubAdmin } from '@/lib/db/clubs'
import { notFound, redirect } from 'next/navigation'
import { MatchResultsClient } from './match-results-client'
import type { Metadata } from 'next'

interface MatchResultsPageProps {
  params: Promise<{
    locale: string
    clubId: string
    matchId: string
  }>
}

export async function generateMetadata({ params }: MatchResultsPageProps): Promise<Metadata> {
  const { locale, clubId, matchId } = await params
  // Could fetch match title here
  return {
    title: 'Match Results',
  }
}

export default async function MatchResultsPage({ params }: MatchResultsPageProps) {
  const { locale, clubId, matchId } = await params
  
  // Get user ID
  const userId = await getUserIdFromHeaders()
  if (!userId) {
    redirect(`/auth/login`)
  }

  // Check admin status
  const isOwner = await isClubAdmin(clubId, userId)

  // Fetch match data
  const match = await getMatch(matchId)
  if (!match) {
    notFound()
  }

  // Check if match status allows viewing results
  // IN_PROGRESS, FINISHED, COMPLETED can view results
  if (match.status === 'SCHEDULED' || match.status === 'CANCELLED') {
    // Redirect to match detail page
    redirect(`/${locale}/clubs/${clubId}/matches/${matchId}`)
  }

  // Fetch goals and members
  const [goals, members] = await Promise.all([
    getMatchGoals(matchId),
    getClubMembers(clubId),
  ])

  // Determine if editing is allowed
  const canEdit = isOwner && match.status !== 'COMPLETED'

  return (
    <MatchResultsClient
      locale={locale}
      clubId={clubId}
      matchId={matchId}
      match={match}
      goals={goals}
      members={members}
      isAdmin={isOwner}
      canEdit={canEdit}
    />
  )
}
