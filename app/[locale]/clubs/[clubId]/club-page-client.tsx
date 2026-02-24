"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { authFetch } from "@/lib/auth-fetch";
import { ArrowLeft, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

interface ClubData {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export default function ClubPageClient() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const clubId = params.clubId as string;
  const locale = params.locale as string;
  
  const [club, setClub] = useState<ClubData | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.id) {
      authFetch(`/api/clubs/${clubId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            router.push("/clubs");
            return;
          }
          setClub(data);
          
          // Get player count
          return authFetch(`/api/clubs/${clubId}/players`);
        })
        .then(res => res?.json())
        .then(playersData => {
          if (Array.isArray(playersData)) {
            setPlayerCount(playersData.length);
          }
          
          // Check admin status
          return authFetch(`/api/clubs/${clubId}/admin`);
        })
        .then(adminRes => adminRes?.json())
        .then(adminData => {
          setIsOwner(adminData?.isOwner || false);
          setLoading(false);
        })
        .catch(() => {
          router.push("/clubs");
        });
    }
  }, [sessionLoading, session, clubId, router]);

  if (loading || sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!club) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Link href="/clubs" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span>Indietro</span>
        </Link>
        
        <div className="flex-1" />

        {isOwner && (
          <Link href={`/clubs/${clubId}/settings`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <span>Impostazioni</span>
            <Settings className="h-4 w-4" />
          </Link>
        )}
        {!isOwner && <div className="w-16" />}
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {club.image_url ? (
              <img src={club.image_url} alt={club.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{club.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{club.name}</h1>
              {club.description && <p className="text-muted-foreground">{club.description}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/clubs/${clubId}/roster`} className="bg-card rounded-lg p-6 border hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Rosa</h3>
            <p className="text-3xl font-bold">{playerCount}</p>
          </Link>
          
          <Link href={`/clubs/${clubId}/matches`} className="bg-card rounded-lg p-6 border hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Partite</h3>
            <p className="text-3xl font-bold">→</p>
          </Link>
          
          <Link href={`/clubs/${clubId}/stats`} className="bg-card rounded-lg p-6 border hover:bg-accent transition-colors">
            <h3 className="text-lg font-semibold mb-2">Statistiche</h3>
            <p className="text-3xl font-bold">→</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
