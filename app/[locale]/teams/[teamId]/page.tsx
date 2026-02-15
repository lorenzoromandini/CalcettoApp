import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TeamDetailPage } from "./team-detail-page";

export async function generateMetadata({
  params: { locale, teamId },
}: {
  params: { locale: string; teamId: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "teams" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function TeamPage({
  params: { locale, teamId },
}: {
  params: { locale: string; teamId: string };
}) {
  return <TeamDetailPage locale={locale} teamId={teamId} />;
}
