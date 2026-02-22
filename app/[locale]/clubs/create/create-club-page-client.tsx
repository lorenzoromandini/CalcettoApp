"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClubForm } from "@/components/clubs/club-form";
import { useCreateClub } from "@/hooks/use-clubs";
import { Header } from "@/components/navigation/header";
import type { CreateClubInput } from "@/lib/validations/club";

interface CreateClubPageClientProps {
  locale: string;
}

export function CreateClubPageClient({ locale }: CreateClubPageClientProps) {
  const t = useTranslations("clubs");
  const router = useRouter();
  const { createClub, isPending } = useCreateClub();

  const handleSubmit = async (data: CreateClubInput) => {
    const clubId = await createClub(data);
    router.push(`/${locale}/clubs/${clubId}`);
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
            <ClubForm
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
