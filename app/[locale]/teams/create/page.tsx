import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateTeamPageClient } from "./create-team-page-client";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "teams" });
  return {
    title: t("create"),
    description: t("createDescription"),
  };
}

export default function CreateTeamPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <CreateTeamPageClient locale={locale} />;
}
