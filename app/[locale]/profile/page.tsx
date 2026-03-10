'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { authFetch } from "@/lib/auth-fetch";
import { ProfileForm } from "./profile-form";
import { Loader2, ArrowLeft, Users, ChevronRight, Save, X, Shirt, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { PlayerRole } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlayerCard } from "@/components/players/fut-player-card";
import { Header } from "@/components/navigation/header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClubWithJersey {
  id: string;
  name: string;
  jerseyNumber: number | null;
  playerId: string | null;
  imageUrl: string | null;
  primaryRole: string;
  secondaryRoles: string[];
  privileges: string;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  image: string | null;
}

const availableRoles = [
  { value: 'POR', label: 'Portiere' },
  { value: 'DIF', label: 'Difensore' },
  { value: 'CEN', label: 'Centrocampista' },
  { value: 'ATT', label: 'Attaccante' },
];

export default function ProfilePageClient() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'it';
  
  const [clubs, setClubs] = useState<ClubWithJersey[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedClub, setSelectedClub] = useState<ClubWithJersey | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    jerseyNumber: 0,
    primaryRole: '',
    secondaryRoles: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await authFetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        localStorage.clear();
        window.location.href = '/';
      } else {
        throw new Error('Failed to delete account');
      }
    } catch {
      alert('Errore nell\'eliminazione dell\'account');
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.id) {
      Promise.all([
        authFetch("/api/user").then(res => res.json()),
        authFetch("/api/user/clubs").then(res => res.json())
      ])
        .then(([userData, clubsData]) => {
          if (!userData.error && userData.id) {
            const user = {
              id: userData.id,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              nickname: userData.nickname,
              image: userData.image,
            };
            setUserData(user);
            localStorage.setItem("user-data", JSON.stringify(userData));
          }
          if (Array.isArray(clubsData?.clubs)) {
            setClubs(clubsData.clubs);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [sessionLoading, session, router]);

  const handleClubClick = (club: ClubWithJersey) => {
    router.push(`/profile/clubs/${club.id}`);
  };

  const handleSave = async () => {
    if (!selectedClub || !session?.user?.id) return;

    setIsSaving(true);
    try {
      const res = await authFetch(`/api/clubs/${selectedClub.id}/members/${selectedClub.playerId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        throw new Error('Failed to update');
      }

      // Update local state
      setClubs(prev => prev.map(c => 
        c.id === selectedClub.id 
          ? { ...c, ...editData }
          : c
      ));
      
      setIsEditing(false);
      setSelectedClub(null);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Errore nel salvare le modifiche');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecondaryRoleToggle = (role: string) => {
    setEditData(prev => ({
      ...prev,
      secondaryRoles: prev.secondaryRoles.includes(role)
        ? prev.secondaryRoles.filter(r => r !== role)
        : [...prev.secondaryRoles, role],
    }));
  };

  const getCurrentClubForCard = () => {
    if (!selectedClub || !userData) return null;
    return {
      id: selectedClub.playerId || '',
      clubId: selectedClub.id,
      userId: session?.user?.id || '',
      jerseyNumber: editData.jerseyNumber,
      primaryRole: editData.primaryRole as PlayerRole,
      secondaryRoles: editData.secondaryRoles as PlayerRole[],
      symbol: null,
      joinedAt: new Date().toISOString(),
      privileges: selectedClub.privileges as any,
      user: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        nickname: userData.nickname,
        image: userData.image,
      },
      club: {
        image: selectedClub.imageUrl,
      },
    };
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!session?.user || !userData) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Card Preview when editing */}
        {isEditing && selectedClub && userData && (
          <div className="mb-8 flex justify-center">
            <div className="w-[280px]">
              <PlayerCard
                member={getCurrentClubForCard()!}
                clubId={selectedClub.id}
                lastMatchRating={null}
                hasMvpInLastMatch={false}
                isAbsent={false}
              />
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="mb-6">
          <ProfileForm
            user={userData}
            clubs={clubs}
          />
        </div>

        {/* Clubs Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Club ({clubs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clubs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Non sei ancora membro di nessun club
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    onClick={() => handleClubClick(club)}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {club.imageUrl ? (
                        <div className="relative w-20 h-12 flex-shrink-0">
                          <Image
                            src={club.imageUrl}
                            alt={club.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-12 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {club.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium break-words leading-tight">{club.name}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Button 
            onClick={() => {
              // Trigger save from ProfileForm
              const form = document.querySelector('form');
              form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }}
            className="flex-1"
            variant="default"
          >
            <Save className="mr-2 h-4 w-4" />
            Salva modifiche
          </Button>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                className="flex-1"
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Elimina Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e tutti i tuoi dati verranno cancellati permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminazione...
                    </>
                  ) : (
                    'Elimina'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}
