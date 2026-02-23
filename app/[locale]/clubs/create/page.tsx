import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateClubPageClient } from "./create-club-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "clubs" });
  return {
    title: t("create"),
    description: t("createDescription"),
  };
}

export default async function CreateClubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CreateClubPageClient locale={locale} />;
}
