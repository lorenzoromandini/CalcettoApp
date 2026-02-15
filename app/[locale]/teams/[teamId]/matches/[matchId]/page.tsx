import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchDetailPageClient } from "./match-detail-page-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "matches" });
  return {
    title: t("detail.title"),
    description: t("description"),
  };
}

export default function MatchDetailPage({
  params: { locale, teamId, matchId },
}: {
  params: { locale: string; teamId: string; matchId: string };
}) {
  return (
    <MatchDetailPageClient
      locale={locale}
      teamId={teamId}
      matchId={matchId}
    />
  );
}
