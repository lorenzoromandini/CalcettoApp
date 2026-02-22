"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { Plus, ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchCard } from "@/components/matches/match-card";
import { useMatches } from "@/hooks/use-matches";
import { useTeam } from "@/hooks/use-teams";
import { isTeamAdmin } from "@/lib/db/teams";
import { useState, useEffect } from "react";

interface MatchesPageClientProps {
  locale: string;
  teamId: string;
}

export function MatchesPageClient({ locale, teamId }: MatchesPageClientProps) {
  const t = useTranslations("matches");
  const teamsT = useTranslations("teams");
  const router = useRouter();
  const { data: session } = useSession();
  const { matches, upcomingMatches, pastMatches, isLoading, error, refetch } = useMatches(teamId);
  const { team } = useTeam(teamId);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (session?.user?.id) {
        const admin = await isTeamAdmin(teamId, session.user.id);
        setIsAdmin(admin);
      }
    }
    checkAdmin();
  }, [teamId, session?.user?.id]);

  const handleBack = () => {
    router.push(`/${locale}/teams/${teamId}`);
  };

  const handleCreateMatch = () => {
    router.push(`/${locale}/teams/${teamId}/matches/create`);
  };

  const handleMatchClick = (matchId: string) => {
    router.push(`/${locale}/teams/${teamId}/matches/${matchId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleBack} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {teamsT("back")}
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={handleBack} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {teamsT("back")}
        </Button>
        
        {/* Centered title for mobile - absolutely centered horizontally at top */}
        <div className="md:hidden absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          {team && (
            <p className="text-sm text-muted-foreground">{team.name}</p>
          )}
        </div>
        
        {/* Left-aligned title for desktop */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          {team && (
            <p className="text-sm text-muted-foreground">{team.name}</p>
          )}
        </div>
        
        {/* Spacer to balance the back button on mobile */}
        <div className="md:hidden w-10" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">{t("tabs.upcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("tabs.past")}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMatches.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CalendarDays className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("empty.upcoming.title")}</h3>
                <p className="text-muted-foreground mb-4">{t("empty.upcoming.description")}</p>
              </CardContent>
            </Card>
          ) : (
            upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                teamId={teamId}
                onClick={() => handleMatchClick(match.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMatches.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("empty.past.title")}</h3>
                <p className="text-muted-foreground">{t("empty.past.description")}</p>
              </CardContent>
            </Card>
          ) : (
            pastMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                teamId={teamId}
                onClick={() => handleMatchClick(match.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Action - Create Match */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateMatch}>
        <CardContent className="p-6 text-center">
          <Button className="w-full h-12">
            <Plus className="mr-2 h-5 w-5" />
            Crea partita
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
