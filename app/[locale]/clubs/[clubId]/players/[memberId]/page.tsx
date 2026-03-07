'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ClubPrivilege } from "@prisma/client";
import { Header } from "@/components/navigation/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Calendar, 
  Settings, 
  UserCog, 
  Trash2
} from "lucide-react";
import { PlayerCard } from "@/components/players/fut-player-card";
import { authFetch } from "@/lib/auth-fetch";
import { useSession } from "@/components/providers/session-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlayerProfileData {
  id: string;
  clubId: string;
  userId: string;
  jerseyNumber: number;
  primaryRole: string;
  secondaryRoles: string[];
  symbol: string | null;
  privileges: string;
  joinedAt: string;
  user: {
    firstName: string;
    lastName: string;
    nickname: string | null;
    image: string | null;
  };
}

interface PlayerStats {
  matchesPlayed: number;
  goalsScored: number;
  assists: number;
  avgRating: number | null;
  ratings: Array<{
    id: string;
    rating: { toNumber: () => number };
  }>;
}

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<PlayerProfileData | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const clubId = params.clubId as string;
  const memberId = params.memberId as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch member data
        const memberRes = await authFetch(`/api/clubs/${clubId}/members/${memberId}`);
        if (!memberRes.ok) {
          notFound();
        }
        const memberData = await memberRes.json();
        setMember(memberData);

        // Fetch stats
        const statsRes = await authFetch(`/api/clubs/${clubId}/members/${memberId}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Check if current user is owner
        const adminRes = await authFetch(`/api/clubs/${clubId}/admin`);
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setIsOwner(adminData.isOwner);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clubId && memberId) {
      loadData();
    }
  }, [clubId, memberId]);

  const handlePrivilegeChange = async (newPrivilege: ClubPrivilege) => {
    if (!isOwner || !member) return;

    try {
      const res = await authFetch(`/api/clubs/${clubId}/members/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privileges: newPrivilege }),
      });

      if (!res.ok) {
        throw new Error('Failed to update privilege');
      }

      // Reload data
      window.location.reload();
    } catch (error) {
      console.error('Failed to update privilege:', error);
      alert('Errore nell\'aggiornamento del privilegio');
    }
  };

  const handleRemove = async () => {
    if (!member) return;

    setIsRemoving(true);
    try {
      const res = await authFetch(`/api/clubs/${clubId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to remove member');
      }

      router.push(`/clubs/${clubId}/roster`);
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Errore nella rimozione del membro');
    } finally {
      setIsRemoving(false);
      setShowRemoveDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </main>
      </div>
    );
  }

  if (!member) {
    return notFound();
  }

  const lastMatchRating = stats?.ratings.length ? stats.ratings[0].rating.toNumber() : null;
  const hasMvpInLastMatch = lastMatchRating && lastMatchRating >= 8;
  const isAbsent = !stats?.ratings.length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Carta FUT in alto al centro */}
        <div className="flex justify-center mb-8">
          <div className="relative w-[280px]">
            <PlayerCard
              member={{
                id: member.id,
                clubId: member.clubId,
                userId: member.userId,
                jerseyNumber: member.jerseyNumber,
                primaryRole: member.primaryRole as any,
                secondaryRoles: member.secondaryRoles as any[],
                symbol: member.symbol,
                joinedAt: member.joinedAt,
                privileges: member.privileges as ClubPrivilege,
                user: member.user,
                club: { image: null }
              }}
              clubId={clubId}
              lastMatchRating={lastMatchRating}
              hasMvpInLastMatch={!!hasMvpInLastMatch}
              isAbsent={isAbsent}
            />
            
            {/* Ingranaggio gestione privilegi - solo OWNER */}
            {isOwner && member.userId !== session?.user?.id && member.privileges !== ClubPrivilege.OWNER && (
              <div className="absolute -top-4 -right-12">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Solo per membri normali: opzione per nominare Manager */}
                    {member.privileges === ClubPrivilege.MEMBER && (
                      <DropdownMenuItem onClick={() => handlePrivilegeChange(ClubPrivilege.MANAGER)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Nomina Manager
                      </DropdownMenuItem>
                    )}
                    {/* Solo per Manager: opzione per rimuovere */}
                    {member.privileges === ClubPrivilege.MANAGER && (
                      <DropdownMenuItem onClick={() => handlePrivilegeChange(ClubPrivilege.MEMBER)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Rimuovi Manager
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowRemoveDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Espelli dal club
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Statistiche */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground text-center">
                  Partite giocate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats?.matchesPlayed || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground text-center">
                  Gol segnati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats?.goalsScored || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground text-center">
                  Assist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats?.assists || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground text-center">
                  Media voto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {stats?.avgRating ? stats.avgRating.toFixed(1) : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ultime valutazioni */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Ultime valutazioni</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.ratings && stats.ratings.length > 0 ? (
                <div className="space-y-2">
                  {stats.ratings.map((rating, index) => (
                    <div
                      key={rating.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <span className="text-sm text-muted-foreground">
                        Partita {stats.ratings.length - index}
                      </span>
                      <span className="font-bold">{rating.rating.toNumber().toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Nessuna partita completata
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialog di conferma rimozione */}
      {showRemoveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                Conferma rimozione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Sei sicuro di voler rimuovere {member.user.firstName} {member.user.lastName} dal club?
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowRemoveDialog(false)}
                  disabled={isRemoving}
                >
                  Annulla
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? 'Rimozione...' : 'Conferma'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
