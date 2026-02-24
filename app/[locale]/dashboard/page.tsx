"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface Club {
  id: string;
  name: string;
  description: string | null;
  memberCount?: number;
}

export default function DashboardPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    const userDataStr = localStorage.getItem("user-data");
    
    console.log("Dashboard: token exists:", !!token);
    console.log("Dashboard: userData exists:", !!userDataStr);
    
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

    // Fetch clubs from main clubs API
    authFetch("/api/clubs")
      .then(async res => {
        console.log("Dashboard: API response status:", res.status);
        const data = await res.json();
        console.log("Dashboard: API response data:", data);
        if (res.ok && Array.isArray(data)) {
          setClubs(data);
          setError(null);
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch(err => {
        console.error("Dashboard: API error:", err);
        setError("Failed to fetch clubs");
      })
      .finally(() => setLoading(false));
  }, []);

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
        <div className="grid gap-4 md:hidden">
          <Card className="min-h-[200px]">
            <CardHeader>
              <CardTitle>La mia carta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ciao, {userName || "Utente"}!
              </p>
              {error && (
                <p className="text-sm text-red-500 mt-2">Errore: {error}</p>
              )}
            </CardContent>
          </Card>

          <Link href="/clubs">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Club</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{clubs.length}</p>
                <p className="text-sm text-muted-foreground">Club disponibili</p>
                {clubs.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {clubs.map(club => (
                      <p key={club.id} className="text-xs text-muted-foreground">
                        - {club.name} ({club.memberCount || 0} membri)
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Prossime partite</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Nessuna partita programmata</p>
            </CardContent>
          </Card>
        </div>

        <div className="hidden md:block">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="text-muted-foreground">Ciao, {userName || "Utente"}!</p>
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
