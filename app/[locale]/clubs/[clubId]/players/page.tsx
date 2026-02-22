import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PlayersPageClient } from "./players-page-client";

interface PlayersPageProps {
  params: Promise<{
    locale: string;
    clubId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlayersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "players" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PlayersPage({
  params,
}: PlayersPageProps) {
  const { locale, clubId } = await params;
  return <PlayersPageClient locale={locale} clubId={clubId} />;
}
