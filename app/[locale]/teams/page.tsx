import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TeamsPageClient } from "./teams-page-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "teams" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function TeamsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <TeamsPageClient locale={locale} />;
}
