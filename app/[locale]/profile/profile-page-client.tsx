"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface TeamWithJersey {
  id: string;
  name: string;
  jerseyNumber: number | null;
  playerId: string | null;
}

export default function ProfilePageClient() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'it';
  
  const [teams, setTeams] = useState<TeamWithJersey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.id) {
      authFetch("/api/user/teams")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.teams)) {
            setTeams(data.teams);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [sessionLoading, session, router]);

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>Indietro</span>
          </Link>
        </div>
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span>Indietro</span>
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {session.user.nickname || session.user.firstName || session.user.email}
            </h1>
            {session.user.firstName && session.user.lastName && (
              <p className="text-muted-foreground">{session.user.firstName} {session.user.lastName}</p>
            )}
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>I tuoi club</CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <p className="text-muted-foreground">Non sei ancora membro di nessun club.</p>
            ) : (
              <div className="space-y-2">
                {clubs.map(team => (
                  <div key={club.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">{club.name}</span>
                    {club.jerseyNumber && (
                      <span className="text-sm text-muted-foreground">#{club.jerseyNumber}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
