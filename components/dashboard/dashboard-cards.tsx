"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface Club {
  id: string;
  name: string;
}

interface DashboardCardsProps {
  clubs: Club[];
}

export function DashboardCards({ clubs }: DashboardCardsProps) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("navigation");
  const [defaultClubId, setDefaultClubId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("defaultClubId");
      setDefaultClubId(stored);
    }
  }, []);

  const getDefaultClubId = () => {
    if (defaultClubId && clubs.some((c) => c.id === defaultClubId)) {
      return defaultClubId;
    }
    return clubs[0]?.id || null;
  };

  const currentClubId = getDefaultClubId();

  return (
    <>
      {/* Partite - Second rectangle */}
      <Link href={currentClubId ? `/clubs/${currentClubId}/matches` : "/clubs"}>
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
