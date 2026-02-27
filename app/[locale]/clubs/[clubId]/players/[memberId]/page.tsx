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

  return (
    <div className="flex min-h-screen flex-col">
      <HidePlayerUrl clubId={clubId} memberId={memberId} />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Profilo giocatore */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card principale con info */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                {/* Avatar o iniziali */}
                <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {member.user.image ? (
                    <img
                      src={member.user.image}
                      alt={member.user.firstName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {(member.user.firstName?.charAt(0) || "") +
                        (member.user.lastName?.charAt(0) || "")}
                    </span>
                  )}
                  {/* Numero maglia */}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {member.jerseyNumber}
                  </div>
                </div>

                {/* Nome e ruolo */}
                <h1 className="text-xl font-bold text-center">
                  {member.user.firstName} {member.user.lastName}
                </h1>
                {member.user.nickname && (
                  <p className="text-muted-foreground">{member.user.nickname}</p>
                )}
                
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Shirt className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {member.primaryRole === "POR"
                      ? "Portiere"
                      : member.primaryRole === "DIF"
                      ? "Difensore"
                      : member.primaryRole === "CEN"
                      ? "Centrocampista"
                      : "Attaccante"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

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
