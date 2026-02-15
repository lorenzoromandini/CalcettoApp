'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamDashboard } from '@/components/teams/team-dashboard';
import { TeamNav } from '@/components/navigation/team-nav';
import { getTeam } from '@/lib/db/teams';
import { getPlayersByTeam } from '@/lib/db/players';
import { createClient } from '@/lib/supabase/client';
import type { Team } from '@/lib/db/schema';

interface TeamDetailPageProps {
  locale: string;
  teamId: string;
}

export function TeamDetailPage({ locale, teamId }: TeamDetailPageProps) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  async function loadTeamData() {
    try {
      setIsLoading(true);
      
      // Check auth
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      // Get team
      const teamData = await getTeam(teamId);
      if (!teamData) {
        router.push(`/${locale}/teams`);
        return;
      }
      
      setTeam(teamData);

      // Get players
      const players = await getPlayersByTeam(teamId);
      setPlayerCount(players.length);

      // Get membership info
      const { data: membership } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        router.push(`/${locale}/teams`);
        return;
      }

      setIsAdmin(membership.role === 'admin' || membership.role === 'co-admin');

      // Get member count
      const { data: members } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId);
      
      setMemberCount(members?.length || 0);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <TeamNav teamId={teamId} isAdmin={isAdmin} />
      
      <div className="mt-6">
        <TeamDashboard
          team={team}
          playerCount={playerCount}
          memberCount={memberCount}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
