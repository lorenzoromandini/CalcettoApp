"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamForm } from "@/components/teams/team-form";
import { useCreateTeam } from "@/hooks/use-teams";
import type { CreateTeamInput } from "@/lib/validations/team";

interface CreateTeamPageClientProps {
  locale: string;
}

export function CreateTeamPageClient({ locale }: CreateTeamPageClientProps) {
  const t = useTranslations("teams");
  const router = useRouter();
  const { createTeam, isPending } = useCreateTeam();

  const handleBack = () => {
    router.push(`/${locale}/teams`);
  };

  const handleSubmit = async (data: CreateTeamInput) => {
    const teamId = await createTeam(data);
    router.push(`/${locale}/teams/${teamId}`);
  };

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
  );
}
