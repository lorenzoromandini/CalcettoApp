import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth-token";
import { MatchStatus } from "@prisma/client";
import { Header } from "@/components/navigation/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Trophy, Star, Calendar } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HidePlayerUrl } from "@/components/players/hide-player-url";
import { PlayerCard } from "@/components/players/fut-player-card";
import { calculateFrameColor } from "@/lib/db/player-ratings";

interface PlayerProfilePageProps {
  params: Promise<{
    locale: string;
    clubId: string;
    memberId: string;
  }>;
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { locale, clubId, memberId } = await params;
  
  // Verifica che l'utente sia autenticato
  // Nota: in un server component non possiamo usare getUserIdFromRequest direttamente
  // quindi verificheremo semplicemente che il membro esista
  
  // Ottieni i dati del membro
  const member = await prisma.clubMember.findFirst({
    where: {
      id: memberId,
      clubId,
    },
    include: {
      user: true,
      club: true,
    },
  });

  if (!member) {
    notFound();
  }

  // Ottieni le statistiche del giocatore
  const matchesPlayed = await prisma.formationPosition.count({
    where: {
      clubMemberId: memberId,
      played: true,
      formation: {
        match: {
          clubId,
          status: MatchStatus.COMPLETED,
        },
      },
    },
  });

  const goalsScored = await prisma.goal.count({
    where: {
      scorerId: memberId,
      match: {
        clubId,
        status: MatchStatus.COMPLETED,
      },
    },
  });

  const assists = await prisma.goal.count({
    where: {
      assisterId: memberId,
      match: {
        clubId,
        status: MatchStatus.COMPLETED,
      },
    },
  });

  const ratings = await prisma.playerRating.findMany({
    where: {
      clubMemberId: memberId,
      match: {
        clubId,
        status: MatchStatus.COMPLETED,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating.toNumber(), 0) / ratings.length
    : null;

  // Calculate new card criteria fields
  const lastMatchRating = ratings.length > 0 ? ratings[0]?.rating.toNumber() : null;
  const hasMvpInLastMatch = ratings.length > 0 && ratings[0]?.rating.toNumber() >= 8;
  const isAbsent = ratings.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <HidePlayerUrl clubId={clubId} memberId={memberId} />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Profilo giocatore */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* FUT Player Card */}
          <div className="md:col-span-1 flex justify-center">
            <div className="max-w-[250px]">
              <PlayerCard
                member={{
                  id: member.id,
                  clubId: member.clubId,
                  userId: member.userId,
                  jerseyNumber: member.jerseyNumber,
                  primaryRole: member.primaryRole,
                  secondaryRoles: member.secondaryRoles,
                  symbol: member.symbol,
                  joinedAt: member.joinedAt.toISOString(),
                  privileges: member.privileges,
                  user: {
                    firstName: member.user.firstName,
                    lastName: member.user.lastName,
                    nickname: member.user.nickname,
                    image: member.user.image
                  }
                }}
                clubId={clubId}
                lastMatchRating={lastMatchRating}
                hasMvpInLastMatch={hasMvpInLastMatch}
                isAbsent={isAbsent}
              />
            </div>
          </div>

          {/* Statistiche */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold">Statistiche</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Partite giocate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{matchesPlayed}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Gol segnati
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{goalsScored}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Assist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{assists}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Media voto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {avgRating ? avgRating.toFixed(1) : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ultime partite */}
            <Card>
              <CardHeader>
                <CardTitle>Ultime valutazioni</CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length > 0 ? (
                  <div className="space-y-2">
                    {ratings.map((rating, index) => (
                      <div
                        key={rating.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="text-sm text-muted-foreground">
                          Partita {ratings.length - index}
                        </span>
                        <span className="font-bold">{rating.rating.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Nessuna partita completata
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
