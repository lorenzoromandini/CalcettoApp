"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/navigation/header";
import { useClubs } from "@/hooks/use-clubs";

interface MatchesPageClientProps {
  locale: string;
}

export function MatchesPageClient({ locale }: MatchesPageClientProps) {
  const t = useTranslations("matches");
  const router = useRouter();
  const { clubs, isLoading } = useClubs();

  const handleCreateClub = () => {
    router.push(`/${locale}/clubs/create`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 mt-2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground">{t("description")}</p>
            </div>
          </div>
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Non hai nessuna squadra disponibile</h3>
              <p className="text-muted-foreground mb-4">Creane una per accedere alla sezione</p>
              <Button onClick={handleCreateClub}>
                <Plus className="mr-2 h-4 w-4" />
                Crea squadra
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nessuna partita disponibile</h3>
            <p className="text-muted-foreground mb-4">Le tue partite appariranno qui</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
