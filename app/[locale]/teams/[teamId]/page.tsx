import TeamPageClient from "./team-page-client";

interface TeamPageProps {
  params: Promise<{
    locale: string;
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  return <TeamPageClient />;
}
