import ClubPageClient from "./club-page-client";

interface ClubPageProps {
  params: Promise<{
    locale: string;
    clubId: string;
  }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  return <ClubPageClient />;
}
