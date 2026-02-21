import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchesPageClient } from "./matches-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "matches" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <MatchesPageClient locale={locale} />;
}
