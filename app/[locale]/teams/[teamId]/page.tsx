import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TeamDashboard } from '@/components/teams/team-dashboard';
import { TeamNav } from '@/components/navigation/team-nav';

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;

  // Check auth with NextAuth
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = session.user.id;

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
      teamId,
      userId,
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    redirect('/teams');
  }

  // Get counts
  const playerCount = await prisma.playerTeam.count({
    where: { teamId },
  });

  const memberCount = await prisma.teamMember.count({
    where: { teamId },
  });

  const isAdmin = membership.role === 'admin' || membership.role === 'co-admin';

  // Map team data to match Team type (convert null to undefined)
  const mappedTeam = {
    id: team.id,
    name: team.name,
    description: team.description || undefined,
    image_url: team.imageUrl || undefined,
    team_mode: team.teamMode as '5-a-side' | '8-a-side' | '11-a-side',
    created_by: team.createdBy,
    created_at: team.createdAt.toISOString(),
    updated_at: team.updatedAt.toISOString(),
    deleted_at: team.deletedAt?.toISOString() || undefined,
    sync_status: 'synced' as const,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TeamNav teamId={teamId} isAdmin={isAdmin} />
      
      <div className="mt-6">
        <TeamDashboard
          team={mappedTeam}
          playerCount={playerCount}
          memberCount={memberCount}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
