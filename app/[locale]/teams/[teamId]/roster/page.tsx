'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTeamMembers } from '@/lib/db/teams';
import { getTeamPlayers } from '@/lib/db/players';
import { TeamRosterManager } from '@/components/teams/team-roster-manager';
import { PlayerCard } from '@/components/players/player-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { TeamMember, Player } from '@/lib/db/schema';

export default function TeamRosterPage() {
  const t = useTranslations('roster');
  const params = useParams();
  const teamId = params.teamId as string;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [players, setPlayers] = useState<(Player & { jersey_number?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'players' | 'members'>('players');
  const { data: session } = useSession();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [membersData, playersData] = await Promise.all([
        getTeamMembers(teamId),
        getTeamPlayers(teamId),
      ]);

      setMembers(membersData);
      setPlayers(playersData);

      // Check current user role
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
        const userMembership = membersData.find((m: TeamMember) => m.user_id === session.user.id);
        setIsAdmin(userMembership?.role === 'admin' || userMembership?.role === 'co-admin');
      }
    } catch (error) {
      console.error('Failed to load roster:', error);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, session?.user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/teams/${teamId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToTeam')}
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">{t('pageTitle')}</h1>

      {/* Simple Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'players' ? 'default' : 'outline'}
          onClick={() => setActiveTab('players')}
          className="flex items-center gap-2"
        >
          <UserCircle className="h-4 w-4" />
          {t('tabs.players')}
        </Button>
        <Button
          variant={activeTab === 'members' ? 'default' : 'outline'}
          onClick={() => setActiveTab('members')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          {t('tabs.members')}
        </Button>
      </div>

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          {players.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">{t('noPlayers')}</p>
                <Link href={`/teams/${teamId}/players/create`} className="mt-4 inline-block">
                  <Button>{t('addPlayer')}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                teamId={teamId}
              />
            ))
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <TeamRosterManager
          teamId={teamId}
          members={members}
          currentUserId={currentUserId || ''}
          isAdmin={isAdmin}
          onMembersChange={loadData}
        />
      )}
    </div>
  );
}
