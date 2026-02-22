"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Users, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClubCard } from "@/components/clubs/club-card";
import { useClubs } from "@/hooks/use-clubs";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/components/providers/session-provider";
import { authFetch } from "@/lib/auth-fetch";

interface ClubsPageClientProps {
  locale: string;
}

interface ClubMemberRole {
  clubId: string;
  role: "admin" | "co-admin" | "member";
}

const DEFAULT_CLUB_KEY = "defaultClubId";

export function ClubsPageClient({ locale }: ClubsPageClientProps) {
  const t = useTranslations("clubs");
  const router = useRouter();
  const { data: session } = useSession();
  const { clubs, isLoading, error, refetch } = useClubs();
  const [userRoles, setUserRoles] = useState<ClubMemberRole[]>([]);
  const [defaultClubId, setDefaultClubId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(DEFAULT_CLUB_KEY);
      setDefaultClubId(stored);
    }
  }, []);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await authFetch("/api/clubs/me");
        if (response.ok) {
          const data = await response.json();
          setUserRoles(data.roles || []);
        }
      } catch (err) {
        console.error("Failed to fetch user roles:", err);
      }
    };
    fetchUserRoles();
  }, [session?.user?.id]);

  const getClubRole = (clubId: string): "admin" | "co-admin" | "member" | undefined => {
    const member = userRoles.find((r) => r.clubId === clubId);
    return member?.role;
  };

  const handleClubClick = (clubId: string) => {
    router.push(`/${locale}/clubs/${clubId}`);
  };

  const handleSetDefault = (clubId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      localStorage.setItem(DEFAULT_CLUB_KEY, clubId);
      setDefaultClubId(clubId);
    }
  };

  const sortedClubs = [...clubs].sort((a, b) => {
    if (a.id === defaultClubId) return -1;
    if (b.id === defaultClubId) return 1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b md:hidden">
          <Link href="/dashboard" className="p-2 -ml-2 flex items-center gap-1">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Indietro</span>
          </Link>
          <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">{t("title")}</h1>
          <div className="w-16" />
        </div>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-12 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b md:hidden">
          <Link href="/dashboard" className="p-2 -ml-2 flex items-center gap-1">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Indietro</span>
          </Link>
          <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">{t("title")}</h1>
          <div className="w-16" />
        </div>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t("title")}</h1>
            </div>
          </div>
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Non hai nessuna squadra disponibile</h3>
              <p className="text-muted-foreground mb-4">Creane una per accedere alla sezione</p>
              {true && (
                <Link href="/clubs/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("create")}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b md:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 flex items-center gap-1">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Indietro</span>
        </Link>
        <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">{t("title")}</h1>
        <div className="w-16" />
      </div>
      <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          {t("description") && <p className="text-muted-foreground">{t("description")}</p>}
        </div>

        {clubs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("empty.title")}</h3>
              <p className="text-muted-foreground mb-4">{t("empty.description")}</p>
              {true && (
                <Link href="/clubs/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("create")}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedClubs.map((club) => (
              <div key={club.id} className="relative">
                <button
                  onClick={(e) => handleSetDefault(club.id, e)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 hover:bg-background shadow-sm transition-colors"
                  title={club.id === defaultClubId ? t("defaultClub") : t("setAsDefault")}
                >
                  <Star
                    className={`h-4 w-4 ${
                      club.id === defaultClubId ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                    }`}
                  />
                </button>
                <ClubCard
                  club={club}
                  onClick={() => handleClubClick(club.id)}
                  memberCount={1}
                  userRole={getClubRole(club.id)}
                  isDefault={club.id === defaultClubId}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {true && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
          <Link href="/clubs/create">
            <Button className="h-14 px-8 rounded-full shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              {t("create")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
