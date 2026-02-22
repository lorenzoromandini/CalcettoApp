"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
}

interface DashboardCardsProps {
  teams: Team[];
}

export function DashboardCards({ teams }: DashboardCardsProps) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("navigation");
  const [defaultClubId, setDefaultTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("defaultClubId");
      setDefaultTeamId(stored);
    }
  }, []);

  const getDefaultTeamId = () => {
    if (defaultClubId && teams.some((t) => t.id === defaultClubId)) {
      return defaultClubId;
    }
    return clubs[0]?.id || null;
  };

  const currentTeamId = getDefaultTeamId();

  return (
    <>
      {/* Partite - Second rectangle */}
      <Link href={currentTeamId ? `/teams/${currentTeamId}/matches` : "/teams"}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">{tNav("matches") || "Partite"}</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">{t("stats.matchesDescription") || "Partite giocate"}</p>
          </CardContent>
        </Card>
      </Link>
    </>
  );
}
