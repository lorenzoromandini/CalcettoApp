'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shirt, Save } from "lucide-react";
import Link from "next/link";
import { authFetch } from "@/lib/auth-fetch";
import { useSession } from "@/components/providers/session-provider";
import { PlayerRole } from "@prisma/client";
import { RoleSelector } from "@/components/players/role-selector";

interface ClubData {
  id: string;
  name: string;
  imageUrl: string | null;
  jerseyNumber: number;
  primaryRole: string;
  secondaryRoles: string[];
  membershipId: string;
}

export default function ClubEditPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const clubId = params.clubId as string;

  const [jerseyNumber, setJerseyNumber] = useState(0);
  const [primaryRole, setPrimaryRole] = useState<PlayerRole | null>(null);
  const [secondaryRoles, setSecondaryRoles] = useState<PlayerRole[]>([]);

  useEffect(() => {
    const loadClub = async () => {
      if (!session?.user?.id || !clubId) return;
      
      try {
        const res = await authFetch(`/api/users/${session.user.id}/clubs`);
        if (res.ok) {
          const clubs = await res.json();
          const currentClub = clubs.find((c: ClubData) => c.id === clubId || c.clubId === clubId);
          if (currentClub) {
            setClub(currentClub);
            setJerseyNumber(currentClub.jerseyNumber || 0);
            setPrimaryRole(currentClub.primaryRole as PlayerRole || null);
            setSecondaryRoles((currentClub.secondaryRoles || []) as PlayerRole[]);
          }
        }
      } catch (error) {
        console.error('Error loading club:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClub();
  }, [session?.user?.id, clubId]);

  const handleSave = async () => {
    if (!club || !session?.user?.id || !primaryRole) return;

    setIsSaving(true);
    try {
      const editData = {
        jerseyNumber,
        primaryRole,
        secondaryRoles,
      };

      const res = await authFetch(`/api/clubs/${clubId}/members/${club.membershipId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        throw new Error('Failed to update');
      }

      router.push('/profile');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Errore nel salvare le modifiche');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (!club) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Club non trovato</p>
            <Link href="/profile" className="text-primary hover:underline mt-4 inline-block">
              Torna al profilo
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Club Name */}
        <h1 className="text-2xl font-bold mb-6 text-center">{club.name}</h1>

        {/* Jersey Number Card */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shirt className="h-5 w-5" />
              Numero di maglia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="jerseyNumber">Seleziona il tuo numero</Label>
              <Input
                id="jerseyNumber"
                type="number"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 0)}
                min={1}
                max={99}
                className="text-center text-2xl font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Roles Card con RoleSelector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Ruoli</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleSelector
              primaryRole={primaryRole}
              otherRoles={secondaryRoles}
              onPrimaryRoleChange={setPrimaryRole}
              onOtherRolesChange={setSecondaryRoles}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !primaryRole}
          className="w-full h-12 text-lg"
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Applica modifiche
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
