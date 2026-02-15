import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchesPageClient } from "./matches-page-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "matches" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function MatchesPage({
  params: { locale, teamId },
}: {
  params: { locale: string; teamId: string };
}) {
  return <MatchesPageClient locale={locale} teamId={teamId} />;
}
