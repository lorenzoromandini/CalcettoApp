"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { authFetch } from "@/lib/auth-fetch";
import { ArrowLeft, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

interface TeamData {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export default function TeamPageClient() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;
  const locale = params.locale as string;
  
  const [team, setTeam] = useState<TeamData | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.id) {
      authFetch(`/api/teams/${teamId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            router.push("/teams");
            return;
          }
          setTeam(data);
          
          // Get player count
          return authFetch(`/api/teams/${teamId}/players`);
        })
        .then(res => res?.json())
        .then(playersData => {
          if (Array.isArray(playersData)) {
            setPlayerCount(playersData.length);
          }
          
          // Check admin status
          return authFetch(`/api/teams/${teamId}/admin`);
        })
        .then(adminRes => adminRes?.json())
        .then(adminData => {
          setIsAdmin(adminData?.isAdmin || false);
          setLoading(false);
        })
        .catch(() => {
          router.push("/teams");
        });
    }
  }, [sessionLoading, session, teamId, router]);

  if (loading || sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!team) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Link href="/teams" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span>Indietro</span>
        </Link>
        
        <div className="flex-1" />

        {isAdmin && (
          <Link href={`/teams/${teamId}/settings`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <span>Impostazioni</span>
            <Settings className="h-4 w-4" />
          </Link>
        )}
        {!isAdmin && <div className="w-16" />}
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {team.image_url ? (
              <img src={team.image_url} alt={team.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{team.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{team.name}</h1>
              {team.description && <p className="text-muted-foreground">{team.description}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/teams/${teamId}/roster`} className="bg-card rounded-lg p-6 border hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Rosa</h3>
            <p className="text-3xl font-bold">{playerCount}</p>
          </Link>
          
          <Link href={`/teams/${teamId}/matches`} className="bg-card rounded-lg p-6 border hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Partite</h3>
            <p className="text-3xl font-bold">→</p>
          </Link>
          
          <Link href={`/teams/${teamId}/stats`} className="bg-card rounded-lg p-6 border hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Statistiche</h3>
            <p className="text-3xl font-bold">→</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
