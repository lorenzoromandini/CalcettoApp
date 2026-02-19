import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreatePlayerPageClient } from "./create-player-page-client";

interface CreatePlayerPageProps {
  params: Promise<{
    locale: string;
    teamId: string;
  }>;
}

export async function generateMetadata({
  params,
}: CreatePlayerPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "players" });
  return {
    title: t("create"),
    description: t("createDescription"),
  };
}

export default async function CreatePlayerPage({
  params,
}: CreatePlayerPageProps) {
  const { locale, teamId } = await params;
  return <CreatePlayerPageClient locale={locale} teamId={teamId} />;
}
