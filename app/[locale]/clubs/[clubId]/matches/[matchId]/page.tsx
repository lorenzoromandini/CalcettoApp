import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchDetailPageClient } from "./match-detail-page-client";

interface MatchDetailPageProps {
  params: Promise<{
    locale: string;
    clubId: string;
    matchId: string;
  }>;
  searchParams: Promise<{
    from?: string;
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
  searchParams,
}: MatchDetailPageProps) {
  const { locale, clubId, matchId } = await params;
  const { from } = await searchParams;
  return (
    <MatchDetailPageClient
      locale={locale}
      clubId={clubId}
      matchId={matchId}
      from={from}
    />
  );
}
