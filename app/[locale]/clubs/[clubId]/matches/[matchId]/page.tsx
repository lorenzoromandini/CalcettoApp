import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchDetailPageClient } from "./match-detail-page-client";

interface MatchDetailPageProps {
  params: Promise<{
    locale: string;
    clubId: string;
    matchId: string;
  }>;
}

export async function generateMetadata({
  params,
}: MatchDetailPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "matches" });
  return {
    title: t("detail.title"),
    description: t("description"),
  };
}

export default async function MatchDetailPage({
  params,
}: MatchDetailPageProps) {
  const { locale, clubId, matchId } = await params;
  return (
    <MatchDetailPageClient
      locale={locale}
      clubId={clubId}
      matchId={matchId}
    />
  );
}
