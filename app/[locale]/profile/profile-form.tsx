'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { profileSchema, type ProfileInput } from '@/lib/validations/auth';
import { AvatarCropper } from '@/components/players/avatar-cropper';
import { Shirt, User, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TeamWithJersey {
  id: string;
  name: string;
  jerseyNumber: number | null;
  playerId: string | null;
}

interface ProfileFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    nickname: string | null;
    image: string | null;
  };
  teams: TeamWithJersey[];
}

export function ProfileForm({ user, teams: initialTeams }: ProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string | null>(user.image);
  const [avatarBlob, setAvatarBlob] = useState<Blob | undefined>(undefined);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teams, setTeams] = useState<TeamWithJersey[]>(initialTeams);
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname || '',
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Errore', { description: 'Seleziona un file immagine valido' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Errore', { description: "L'immagine deve essere inferiore a 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropComplete = useCallback((blob: Blob) => {
    setAvatarBlob(blob);
    setShowCropper(false);
    setAvatarImage(URL.createObjectURL(blob));
  }, []);

  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setAvatarImage(user.image);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [user.image]);

  const handleRemoveAvatar = () => {
    setAvatarImage(null);
    setAvatarBlob(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleJerseyChange = async (teamId: string, jerseyNumber: string) => {
    const number = parseInt(jerseyNumber, 10);
    if (isNaN(number) || number < 1 || number > 99) {
      toast.error('Numero non valido', {
        description: 'Il numero deve essere tra 1 e 99',
      });
      return;
    }

    setSavingTeamId(teamId);
    try {
      const response = await fetch('/api/user/jersey', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, jerseyNumber: number }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error('Errore', {
          description: result.error || 'Si è verificato un errore',
        });
        return;
      }

      setTeams(teams.map(t => 
        t.id === teamId ? { ...t, jerseyNumber: number } : t
      ));
      
      toast.success('Numero maglia aggiornato', {
        description: `Il tuo numero è ora ${number}`,
      });
    } catch {
      toast.error('Errore', {
        description: 'Si è verificato un errore durante il salvataggio',
      });
    } finally {
      setSavingTeamId(null);
    }
  };

  const getAvailableNumbers = () => {
    return Array.from({ length: 99 }, (_, i) => i + 1);
  };

  const onSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('nickname', data.nickname || '');
      if (avatarBlob) {
        formData.append('image', avatarBlob);
      } else if (avatarImage === null && user.image) {
        formData.append('removeImage', 'true');
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Errore durante il salvataggio');
      }

      const result = await response.json();
      
      await updateSession({
        firstName: result.firstName,
        lastName: result.lastName,
        nickname: result.nickname,
      });

      toast.success('Profilo aggiornato', {
        description: 'Le modifiche sono state salvate con successo',
      });
      router.refresh();
    } catch {
      toast.error('Errore', {
        description: 'Si è verificato un errore durante il salvataggio',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showCropper && avatarImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ritaglia immagine</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarCropper
            image={avatarImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Label>Foto profilo</Label>
        <div className="flex items-center gap-4">
          {avatarImage ? (
            <div className="relative">
              <Image
                src={avatarImage}
                alt="Avatar preview"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-input"
            />
            <Label
              htmlFor="avatar-input"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Button type="button" variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {avatarImage ? 'Cambia' : 'Carica'}
                </span>
              </Button>
            </Label>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="Nome"
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome *</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="Cognome"
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname (opzionale)</Label>
        <Input
          id="nickname"
          {...register('nickname')}
          placeholder="Il tuo soprannome"
        />
        {errors.nickname && (
          <p className="text-sm text-destructive">{errors.nickname.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvataggio...' : 'Salva modifiche'}
      </Button>

      {teams.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Numeri Maglia</CardTitle>
            </div>
            <CardDescription>
              Gestisci i tuoi numeri di maglia per ogni squadra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium">{team.name}</Label>
                  <Select
                    value={team.jerseyNumber?.toString() || ''}
                    onValueChange={(value) => handleJerseyChange(team.id, value)}
                    disabled={savingTeamId === team.id}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Seleziona numero" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableNumbers().map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {savingTeamId === team.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </form>
  );
}
