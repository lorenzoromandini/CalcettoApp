import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreatePlayerPageClient } from "./create-player-page-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "players" });
  return {
    title: t("create"),
    description: t("createDescription"),
  };
}

export default function CreatePlayerPage({
  params: { locale, teamId },
}: {
  params: { locale: string; teamId: string };
}) {
  return <CreatePlayerPageClient locale={locale} teamId={teamId} />;
}
