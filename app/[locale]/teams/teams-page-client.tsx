"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/teams/team-card";
import { useTeams } from "@/hooks/use-teams";
import { Card, CardContent } from "@/components/ui/card";

interface TeamsPageClientProps {
  locale: string;
}

export function TeamsPageClient({ locale }: TeamsPageClientProps) {
  const t = useTranslations("teams");
  const router = useRouter();
  const { teams, isLoading, error, refetch } = useTeams();

  const handleCreateTeam = () => {
    router.push(`/${locale}/teams/create`);
  };

  const handleTeamClick = (teamId: string) => {
    router.push(`/${locale}/teams/${teamId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 mt-2 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-12 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{t("errorLoading")}</p>
            <Button onClick={refetch} variant="outline" className="mt-4">
              {t("retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleCreateTeam} className="h-12">
          <Plus className="mr-2 h-4 w-4" />
          {t("create")}
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("empty.title")}</h3>
            <p className="text-muted-foreground mb-4">{t("empty.description")}</p>
            <Button onClick={handleCreateTeam}>
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onClick={() => handleTeamClick(team.id)}
              memberCount={1} // TODO: Get actual member count
            />
          ))}
        </div>
      )}
    </div>
  );
}
