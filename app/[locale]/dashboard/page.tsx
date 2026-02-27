"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { DashboardPlayerCard } from "@/components/dashboard/dashboard-player-card";
import type { DashboardMemberData } from "@/lib/db/player-ratings";

interface Club {
  id: string;
  name: string;
  description: string | null;
  memberCount?: number;
}

interface ClubPrivileges {
  isOwner: boolean;
  isManager: boolean;
}

export default function DashboardPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberData, setMemberData] = useState<DashboardMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [defaultClubId, setDefaultClubId] = useState<string | null>(null);
  const [clubPrivileges, setClubPrivileges] = useState<ClubPrivileges | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    const userDataStr = localStorage.getItem("user-data");
    const storedDefaultClub = localStorage.getItem("defaultClubId");
    
    if (storedDefaultClub) {
      setDefaultClubId(storedDefaultClub);
    }
    
    console.log("Dashboard: token exists:", !!token);
    console.log("Dashboard: userData exists:", !!userDataStr);
    console.log("Dashboard: defaultClubId:", storedDefaultClub);
    
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }

    // Try to get user data from localStorage
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUserName(userData.firstName || userData.nickname || userData.email || "");
      } catch {
        setUserName("");
      }
    }

    // Fetch clubs and member data - usa il club preferito se presente
    const dashboardUrl = storedDefaultClub 
      ? `/api/user/dashboard?clubId=${storedDefaultClub}` 
      : "/api/user/dashboard";
    
    Promise.all([
      authFetch("/api/clubs"),
      authFetch(dashboardUrl)
    ])
      .then(async ([clubsRes, memberRes]) => {
        console.log("Dashboard: API response status:", clubsRes.status);
        
        // Handle clubs
        const clubsData = await clubsRes.json();
        console.log("Dashboard: Clubs data:", clubsData);
        if (clubsRes.ok && Array.isArray(clubsData)) {
          setClubs(clubsData);
          // Se non c'è un club preferito salvato, usa il primo
          if (!storedDefaultClub && clubsData.length > 0) {
            setDefaultClubId(clubsData[0].id);
          }
        }
        
        // Handle member data - se c'è un club preferito, usa quello
        if (memberRes.ok) {
          const memberData = await memberRes.json();
          console.log("Dashboard: Member data:", memberData);
          if (memberData && !memberData.error) {
            setMemberData(memberData);
          }
        }
        
        setError(null);
      })
      .catch(err => {
        console.error("Dashboard: API error:", err);
        setError("Failed to fetch data");
      })
      .finally(() => setLoading(false));
    
    // Fetch club privileges se c'è un club preferito
    if (storedDefaultClub) {
      authFetch(`/api/clubs/${storedDefaultClub}/admin`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setClubPrivileges({
              isOwner: data.isOwner || false,
              isManager: data.isManager || false
            });
          }
        })
        .catch(err => {
          console.error("Dashboard: Failed to fetch privileges:", err);
        });
    }
  }, []);

  // Filtra i dati per il club preferito
  const favoriteClub = clubs.find(c => c.id === defaultClubId);
  const memberDataForFavorite = memberData?.clubId === defaultClubId ? memberData : null;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* La mia carta - più grande */}
          {memberData ? (
            <div className="flex justify-center pt-20 pb-10">
              <div className="scale-[2] transform-gpu">
                <DashboardPlayerCard 
                  data={memberData} 
                  locale={typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'it'}
                />
              </div>
            </div>
          ) : (
            <Card className="min-h-[200px]">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-base text-muted-foreground mb-3">
                  Non sei ancora membro di nessun club
                </p>
                <Link 
                  href="/clubs"
                  className="text-base text-primary hover:underline font-medium"
                >
                  Unisciti o crea un club
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Separatore */}
          <Separator className="mt-14 mb-4" />

          {/* Due quadrati affiancati: Club e Prossime partite */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/clubs">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full aspect-square flex flex-col">
                <CardHeader className="flex-1 flex flex-col items-center justify-center space-y-2 pb-0">
                  <Users className="h-12 w-12 text-primary" />
                  <CardTitle className="text-xl font-bold text-center">Club</CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-4">
                  <p className="text-sm text-muted-foreground">
                    {clubs.length > 0 ? 'Gestisci' : 'Crea'}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="h-full aspect-square flex flex-col">
              <CardHeader className="flex-1 flex flex-col items-center justify-center space-y-2 pb-0">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">⚽</span>
                </div>
                <CardTitle className="text-xl font-bold text-center">Partite</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-4">
                <p className="text-sm text-muted-foreground">
                  Nessuna
                </p>
              </CardContent>
            </Card>

            {/* Pulsante Crea Partita - visibile solo per OWNER e MANAGER, occupa tutta la larghezza */}
            {(clubPrivileges?.isOwner || clubPrivileges?.isManager) && defaultClubId && (
              <div className="col-span-2">
                <Button
                  asChild
                  className="w-full h-16 text-lg gap-2"
                >
                  <Link href={`/clubs/${defaultClubId}/matches/create`}>
                    <Plus className="h-6 w-6" />
                    Crea Partita
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block">
          {error && (
            <p className="text-red-500 mt-2">Errore: {error}</p>
          )}
          {clubs.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">I tuoi club:</h3>
              <ul className="mt-2 space-y-1">
                {clubs.map(club => (
                  <li key={club.id} className="text-sm text-muted-foreground">
                    {club.name} ({club.memberCount || 0} membri)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
