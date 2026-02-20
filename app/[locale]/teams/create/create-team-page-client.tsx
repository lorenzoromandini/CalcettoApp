"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamForm } from "@/components/teams/team-form";
import { SetupPlayerForm } from "@/components/teams/setup-player-form";
import { useCreateTeam } from "@/hooks/use-teams";
import { Header } from "@/components/navigation/header";
import type { CreateTeamInput } from "@/lib/validations/team";

interface CreateTeamPageClientProps {
  locale: string;
}

export function CreateTeamPageClient({ locale }: CreateTeamPageClientProps) {
  const t = useTranslations("teams");
  const router = useRouter();
  const { createTeam, isPending } = useCreateTeam();

  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const [createdTeamName, setCreatedTeamName] = useState<string>("");

  const handleTeamCreated = async (data: CreateTeamInput) => {
    const teamId = await createTeam(data);
    setCreatedTeamId(teamId);
    setCreatedTeamName(data.name);
  };

  const handleSetupComplete = () => {
    router.push(`/${locale}/teams/${createdTeamId}`);
  };

  const handleSetupSkip = () => {
    router.push(`/${locale}/teams/${createdTeamId}`);
  };

  if (createdTeamId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-lg">
          <SetupPlayerForm
            teamId={createdTeamId}
            teamName={createdTeamName}
            onSuccess={handleSetupComplete}
            onCancel={handleSetupSkip}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("create")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamForm
              onSubmit={handleTeamCreated}
              isLoading={isPending}
              submitLabel={t("form.submit")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
