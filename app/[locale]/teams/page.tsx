import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TeamsPageClient } from "./teams-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "teams" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TeamsPageClient locale={locale} />;
}
