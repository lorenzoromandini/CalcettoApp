import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateTeamPageClient } from "./create-team-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "teams" });
  return {
    title: t("create"),
    description: t("createDescription"),
  };
}

export default async function CreateTeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CreateTeamPageClient locale={locale} />;
}
