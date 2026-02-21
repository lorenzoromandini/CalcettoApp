import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TeamDashboard } from '@/components/teams/team-dashboard';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';

interface TeamPageProps {
  params: Promise<{
    locale: string;
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

  const isAdmin = membership.role === 'admin' || membership.role === 'co-admin';

  // Map team data to match Team type (convert null to undefined)
  const mappedTeam = {
    id: team.id,
    name: team.name,
    description: team.description ?? null,
    image_url: team.imageUrl ?? null,
    team_mode: null,
    created_by: team.createdBy,
    created_at: team.createdAt.toISOString(),
    updated_at: team.updatedAt.toISOString(),
    deleted_at: team.deletedAt?.toISOString() ?? null,
    sync_status: null,
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with back button and settings */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Link href="/teams" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span>Indietro</span>
        </Link>
        
        <div className="flex-1" />

        {isAdmin && (
          <Link href={`/teams/${teamId}/settings`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <span>Impostazioni</span>
            <Settings className="h-4 w-4" />
          </Link>
        )}
        {!isAdmin && <div className="w-16" />}
      </div>

      <div className="container mx-auto px-4 py-6">
        <TeamDashboard
          team={mappedTeam}
          playerCount={playerCount}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
