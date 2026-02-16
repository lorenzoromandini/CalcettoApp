import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { TeamDashboard } from '@/components/teams/team-dashboard';
import { TeamNav } from '@/components/navigation/team-nav';

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get team
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .is('deleted_at', null)
    .single();

  if (!team) {
    notFound();
  }

  // Check membership
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    redirect('/teams');
  }

  // Get counts
  const { count: playerCount } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)
    .is('deleted_at', null);

  const { count: memberCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId);

  const isAdmin = membership.role === 'admin' || membership.role === 'co-admin';

  // Map team data to match Team type (convert null to undefined)
  const mappedTeam = {
    ...team,
    description: team.description || undefined,
    team_mode: team.team_mode || '5-a-side',
    deleted_at: team.deleted_at || undefined,
    sync_status: (team.sync_status as 'synced' | 'pending' | 'error') || 'synced',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TeamNav teamId={teamId} isAdmin={isAdmin} />
      
      <div className="mt-6">
        <TeamDashboard
          team={mappedTeam}
          playerCount={playerCount || 0}
          memberCount={memberCount || 0}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
