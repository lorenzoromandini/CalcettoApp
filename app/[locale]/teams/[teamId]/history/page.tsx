import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchHistoryPageClient } from "./match-history-page-client";

interface MatchHistoryPageProps {
  params: Promise<{
    locale: string;
    teamId: string;
  }>;
}

export async function generateMetadata({
  params,
}: MatchHistoryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "history" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MatchHistoryPage({
  params,
}: MatchHistoryPageProps) {
  const { locale, teamId } = await params;
  return <MatchHistoryPageClient locale={locale} teamId={teamId} />;
}
