import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateMatchPageClient } from "./create-match-page-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "matches" });
  return {
    title: t("create"),
    description: t("createDescription"),
  };
}

export default function CreateMatchPage({
  params: { locale, teamId },
}: {
  params: { locale: string; teamId: string };
}) {
  return <CreateMatchPageClient locale={locale} teamId={teamId} />;
}
