import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateMatchPageClient } from "./create-match-page-client";

interface CreateMatchPageProps {
  params: Promise<{
    locale: string;
    teamId: string;
  }>;
}

export async function generateMetadata({
  params,
}: CreateMatchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "matches" });
  return {
    title: t("create"),
    description: t("createDescription"),
  };
}

export default async function CreateMatchPage({
  params,
}: CreateMatchPageProps) {
  const { locale, teamId } = await params;
  return <CreateMatchPageClient locale={locale} teamId={teamId} />;
}
