import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchesPageClient } from "./matches-page-client";

interface MatchesPageProps {
  params: Promise<{
    locale: string;
    teamId: string;
  }>;
}

export async function generateMetadata({
  params,
}: MatchesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "matches" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MatchesPage({
  params,
}: MatchesPageProps) {
  const { locale, teamId } = await params;
  return <MatchesPageClient locale={locale} teamId={teamId} />;
}
