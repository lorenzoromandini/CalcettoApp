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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  membershipId?: string;
  clubId?: string;
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
  const [jerseyInput, setJerseyInput] = useState<string>("");
  const [primaryRole, setPrimaryRole] = useState<PlayerRole | null>(null);
  const [secondaryRoles, setSecondaryRoles] = useState<PlayerRole[]>([]);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadClub = async () => {
      if (!session?.user?.id || !clubId) return;
      
      try {
        const res = await authFetch(`/api/users/${session.user.id}/clubs`);
        if (res.ok) {
          const clubs = await res.json();
          // L'API restituisce clubId, quindi cerchiamo usando clubId
          const currentClub = clubs.find((c: ClubData) => c.clubId === clubId);
          if (currentClub) {
            setClub(currentClub);
            setJerseyNumber(currentClub.jerseyNumber || 0);
            setJerseyInput(currentClub.jerseyNumber ? currentClub.jerseyNumber.toString() : "");
            setPrimaryRole(currentClub.primaryRole as PlayerRole || null);
            setSecondaryRoles((currentClub.secondaryRoles || []) as PlayerRole[]);
          } else {
            console.error('[ClubEditPage] Club not found in user clubs:', clubId);
          }
        } else {
          console.error('[ClubEditPage] Failed to fetch user clubs:', res.status);
        }
      } catch (error) {
        console.error('[ClubEditPage] Error loading club:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClub();
  }, [session?.user?.id, clubId]);

  const handleSave = async () => {
    if (!club || !session?.user?.id || !primaryRole) return;

    console.log('[ClubEditPage] Club object:', club);
    console.log('[ClubEditPage] membershipId:', club.membershipId);
    console.log('[ClubEditPage] club.id:', club.id);

    setIsSaving(true);
    try {
      const editData = {
        jerseyNumber,
        primaryRole,
        secondaryRoles,
      };

      const membershipId = club.membershipId || club.id;
      console.log('[ClubEditPage] Saving with membershipId:', membershipId);

      const res = await authFetch(`/api/clubs/${clubId}/members/${membershipId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[ClubEditPage] Update failed:', res.status, errorData);
        setErrorMessage(errorData.error || `Errore nel salvare: ${res.status}`);
        setErrorDialogOpen(true);
        return;
      }

      router.push('/profile');
    } catch (error) {
      console.error('[ClubEditPage] Error saving:', error);
      alert('Errore nel salvare le modifiche: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
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
                value={jerseyInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setJerseyInput(value);
                  if (value === "") {
                    setJerseyNumber(0);
                  } else {
                    const num = parseInt(value);
                    if (!isNaN(num) && num >= 1 && num <= 99) {
                      setJerseyNumber(num);
                    }
                  }
                }}
                min={1}
                max={99}
                className="text-center text-2xl font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ruolo Principale - Solo Visualizzazione */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Ruolo Principale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/10">
              {primaryRole && (
                <>
                  <img 
                    src={`/icons/roles/${primaryRole === 'POR' ? 'goalkeeper' : primaryRole === 'DIF' ? 'defender' : primaryRole === 'CEN' ? 'midfielder' : 'attacker'}.png`}
                    alt={primaryRole}
                    className="h-8 w-8 object-contain brightness-0 invert"
                  />
                  <span className="font-medium text-primary">
                    {primaryRole === 'POR' && 'Portiere'}
                    {primaryRole === 'DIF' && 'Difensore'}
                    {primaryRole === 'CEN' && 'Centrocampista'}
                    {primaryRole === 'ATT' && 'Attaccante'}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Il ruolo principale non può essere modificato. Contatta un admin del club per cambiarlo.
            </p>
          </CardContent>
        </Card>

        {/* Ruoli Secondari - Modificabili */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Ruoli Secondari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {['POR', 'DIF', 'CEN', 'ATT'].filter(role => role !== primaryRole).map((role) => {
                const isSelected = secondaryRoles.includes(role as PlayerRole);
                const roleName = role === 'POR' ? 'Portiere' : role === 'DIF' ? 'Difensore' : role === 'CEN' ? 'Centrocampista' : 'Attaccante';
                const roleImage = `/icons/roles/${role === 'POR' ? 'goalkeeper' : role === 'DIF' ? 'defender' : role === 'CEN' ? 'midfielder' : 'attacker'}.png`;
                
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      if (secondaryRoles.includes(role as PlayerRole)) {
                        setSecondaryRoles(secondaryRoles.filter(r => r !== role));
                      } else {
                        setSecondaryRoles([...secondaryRoles, role as PlayerRole]);
                      }
                    }}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                      }
                    `}
                  >
                    <img 
                      src={roleImage}
                      alt={roleName}
                      className={`h-8 w-8 object-contain brightness-0 invert ${isSelected ? 'opacity-100' : 'opacity-70'}`}
                    />
                    <span className="text-sm font-medium">{roleName}</span>
                  </button>
                );
              })}
            </div>
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

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Errore</AlertDialogTitle>
              <AlertDialogDescription>
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
