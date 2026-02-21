"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/navigation/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string;
  role: string;
}

function parseToken(token: string): User | null {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }

    const userData = parseToken(token);
    if (!userData) {
      localStorage.removeItem("auth-token");
      window.location.href = "/auth/login";
      return;
    }

    setUser(userData);

    // Fetch teams
    fetch("/api/user/teams")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.teams)) {
          setTeams(data.teams);
        }
      })
      .catch(console.error)
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
                Ciao, {user?.firstName || user?.nickname || user?.email}!
              </p>
            </CardContent>
          </Card>

          <Link href="/teams">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Club</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-sm text-muted-foreground">Club disponibili</p>
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
          <p className="text-muted-foreground">Ciao, {user?.firstName}!</p>
        </div>
      </main>
    </div>
  );
}
