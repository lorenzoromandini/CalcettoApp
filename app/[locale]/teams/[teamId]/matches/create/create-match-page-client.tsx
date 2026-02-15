"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchForm } from "@/components/matches/match-form";
import { useCreateMatch } from "@/hooks/use-matches";
import { useTeam } from "@/hooks/use-teams";
import { isTeamAdmin } from "@/lib/db/teams";
import type { CreateMatchInput } from "@/lib/validations/match";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface CreateMatchPageClientProps {
  locale: string;
  teamId: string;
}

export function CreateMatchPageClient({ locale, teamId }: CreateMatchPageClientProps) {
  const t = useTranslations("matches");
  const router = useRouter();
  const { createMatch, isPending } = useCreateMatch();
  const { team } = useTeam(teamId);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const admin = await isTeamAdmin(teamId, user.id);
        setIsAdmin(admin);
      }
      setIsCheckingAdmin(false);
    }
    checkAdmin();
  }, [teamId]);

  // Redirect if not admin
  useEffect(() => {
    if (!isCheckingAdmin && !isAdmin) {
      router.push(`/${locale}/teams/${teamId}/matches`);
    }
  }, [isCheckingAdmin, isAdmin, router, locale, teamId]);

  const handleBack = () => {
    router.push(`/${locale}/teams/${teamId}/matches`);
  };

  const handleSubmit = async (data: CreateMatchInput) => {
    const matchId = await createMatch(data, teamId);
    router.push(`/${locale}/teams/${teamId}/matches/${matchId}`);
  };

  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("create")}</CardTitle>
          {team && (
            <p className="text-sm text-muted-foreground">{team.name}</p>
          )}
        </CardHeader>
        <CardContent>
          <MatchForm
            teamId={teamId}
            onSubmit={handleSubmit}
            isLoading={isPending}
            submitLabel={t("form.submit")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
