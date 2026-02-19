"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamForm } from "@/components/teams/team-form";
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

  const handleSubmit = async (data: CreateTeamInput) => {
    const teamId = await createTeam(data);
    router.push(`/${locale}/teams/${teamId}`);
  };

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
              onSubmit={handleSubmit}
              isLoading={isPending}
              submitLabel={t("form.submit")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
