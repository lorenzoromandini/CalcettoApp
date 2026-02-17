import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchHistoryPageClient } from "./match-history-page-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "history" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function MatchHistoryPage({
  params: { locale, teamId },
}: {
  params: { locale: string; teamId: string };
}) {
  return <MatchHistoryPageClient locale={locale} teamId={teamId} />;
}
