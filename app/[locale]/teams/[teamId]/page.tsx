import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { TeamDashboard } from '@/components/teams/team-dashboard';
import { TeamNav } from '@/components/navigation/team-nav';
import type { Team, TeamMode, SyncStatus } from '@/lib/db/schema';
import { prisma } from '@/lib/prisma';

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;

  // Check auth
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Get team
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      deletedAt: null,
    },
  });

  if (!team) {
    notFound();
  }

  // Check membership
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: teamId,
      userId: session.user.id,
    },
  });

  if (!membership) {
    redirect('/teams');
  }

  // Get counts
  const playerCount = await prisma.playerTeam.count({
    where: {
      teamId: teamId,
    },
  });

  const memberCount = await prisma.teamMember.count({
    where: {
      teamId: teamId,
    },
  });

  const isAdmin = membership.role === 'admin' || membership.role === 'co-admin';

  // Convert team to match Team type (null -> undefined)
  const teamForDashboard: Team = {
    id: team.id,
    name: team.name,
    description: team.description ?? undefined,
    image_url: team.imageUrl ?? undefined,
    created_by: team.createdBy,
    created_at: team.createdAt.toISOString(),
    updated_at: team.updatedAt.toISOString(),
    deleted_at: team.deletedAt?.toISOString() ?? undefined,
    sync_status: 'synced' as SyncStatus,
    team_mode: (team.teamMode as TeamMode) ?? '5-a-side',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TeamNav teamId={teamId} isAdmin={isAdmin} />
      
      <div className="mt-6">
        <TeamDashboard
          team={teamForDashboard}
          playerCount={playerCount || 0}
          memberCount={memberCount || 0}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
