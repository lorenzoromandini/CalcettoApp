"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { authFetch } from "@/lib/auth-fetch";
import { ProfileForm } from "./profile-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ClubWithJersey {
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
  
  const [clubs, setClubs] = useState<ClubWithJersey[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    nickname: string | null;
    image: string | null;
  } | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.id) {
      // Get fresh user data from API and update localStorage
      Promise.all([
        authFetch("/api/user").then(res => res.json()),
        authFetch("/api/user/clubs").then(res => res.json())
      ])
        .then(([userData, teamsData]) => {
          if (!userData.error && userData.id) {
            const user = {
              id: userData.id,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              nickname: userData.nickname,
              image: userData.image,
            };
            setUserData(user);
            // Update localStorage with fresh data
            localStorage.setItem("user-data", JSON.stringify({
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              nickname: userData.nickname,
              email: userData.email,
              image: userData.image,
            }));
          }
          if (Array.isArray(teamsData?.clubs)) {
            setClubs(teamsData.clubs);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [sessionLoading, session, router]);

  if (sessionLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user || !userData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Indietro
        </Link>
      </div>
      <ProfileForm
        user={userData}
        clubs={clubs}
      />
    </div>
  );
}
