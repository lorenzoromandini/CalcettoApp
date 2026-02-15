import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PlayersPageClient } from "./players-page-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "players" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function PlayersPage({
  params: { locale, teamId },
}: {
  params: { locale: string; teamId: string };
}) {
  return <PlayersPageClient locale={locale} teamId={teamId} />;
}
