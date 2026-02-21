'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTeamMembers, getTeamMembersWithUsers } from '@/lib/db/teams';
import { getTeamPlayers } from '@/lib/db/players';
import { TeamRosterManager } from '@/components/teams/team-roster-manager';
import { PlayerCard } from '@/components/players/player-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/components/providers/session-provider';
import type { TeamMember, Player } from '@/lib/db/schema';

export default function TeamRosterPage() {
  const t = useTranslations('roster');
  const params = useParams();
  const teamId = params.teamId as string;
  const locale = params.locale as string;

  const [members, setMembers] = useState<any[]>([]);
  const [players, setPlayers] = useState<(Player & { jersey_number?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
        const userMembership = membersData.find((m: any) => m.user_id === session.user.id);
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
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/${locale}/teams/${teamId}`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span>Indietro</span>
        </Link>
        
        <h1 className="text-2xl font-bold">Rosa</h1>
        
        {isAdmin && (
          <Link href={`/${locale}/teams/${teamId}/players/create`}>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Aggiungi
            </Button>
          </Link>
        )}
        {!isAdmin && <div className="w-20" />}
      </div>

      {/* Players Section - Shows all members with user accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Giocatori
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show members who have user accounts (including admin/creator) */}
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nessun membro trovato</p>
          ) : (
            <div className="space-y-3">
              {members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.user?.firstName?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.user?.nickname || member.user?.firstName || member.user?.email || 'Utente'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role === 'admin' && 'Admin'}
                        {member.role === 'co-admin' && 'Co-Admin'}
                        {member.role === 'member' && 'Membro'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Management - Admin only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Membri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamRosterManager
              teamId={teamId}
              members={members}
              currentUserId={currentUserId || ''}
              isAdmin={isAdmin}
              onMembersChange={loadData}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
