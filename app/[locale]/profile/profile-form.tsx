'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { profileSchema, type ProfileInput } from '@/lib/validations/auth';
import { AvatarCropper } from '@/components/players/avatar-cropper';
import { Shirt, User, Upload, X, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ClubWithJersey {
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
  clubs: ClubWithJersey[];
}

export function ProfileForm({ user, clubs: initialClubs }: ProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string | null>(user.image);
  const [avatarBlob, setAvatarBlob] = useState<Blob | undefined>(undefined);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clubs, setClubs] = useState<ClubWithJersey[]>(initialClubs);
  const [originalClubs, setOriginalClubs] = useState<ClubWithJersey[]>(initialClubs);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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

  useEffect(() => {
    setOriginalClubs(initialClubs);
  }, [initialClubs]);

  const hasChanges = useCallback(() => {
    const jerseyChanged = clubs.some((club, index) => 
      club.jerseyNumber !== originalClubs[index]?.jerseyNumber
    );
    return avatarBlob !== undefined || jerseyChanged;
  }, [clubs, originalClubs, avatarBlob]);

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

  const handleJerseyChange = (clubId: string, jerseyNumber: string) => {
    const number = parseInt(jerseyNumber, 10);
    if (isNaN(number) || number < 1 || number > 99) {
      return;
    }
    setClubs(clubs.map(t => 
      t.id === clubId ? { ...t, jerseyNumber: number } : t
    ));
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

      const jerseyChanges = clubs.filter((club, index) => 
        club.jerseyNumber !== originalClubs[index]?.jerseyNumber
      ).map(t => ({ clubId: t.id, jerseyNumber: t.jerseyNumber, playerId: t.playerId }));
      
      if (jerseyChanges.length > 0) {
        formData.append('jerseyChanges', JSON.stringify(jerseyChanges));
      }

      const response = await authFetch('/api/user/profile', {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error('Errore', {
          description: result.error || 'Si è verificato un errore durante il salvataggio',
        });
        return;
      }
      
      // Update session with new data including image
      await updateSession({
        firstName: result.firstName,
        lastName: result.lastName,
        nickname: result.nickname,
        image: result.image,
      });

      // Also update localStorage directly for image
      if (result.image) {
        const userDataStr = localStorage.getItem("user-data");
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            userData.image = result.image;
            localStorage.setItem("user-data", JSON.stringify(userData));
          } catch {}
        }
      }

      setOriginalClubs(clubs);
      setAvatarBlob(undefined);
      setShowSuccessDialog(true);
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
                 width={60}
                 height={80}
                 className="rounded-lg object-cover"
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
             <div className="w-[60px] h-[80px] rounded-lg bg-muted flex items-center justify-center">
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

      {clubs.length > 0 && (
        <Card>
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
            {clubs.map((club) => (
              <div key={club.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium">{club.name}</Label>
                  <Select
                    value={club.jerseyNumber?.toString() || ''}
                    onValueChange={(value) => handleJerseyChange(club.id, value)}
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
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button type="submit" disabled={isLoading} className="w-full max-w-xs">
          {isLoading ? 'Salvataggio...' : 'Salva modifiche'}
          {hasChanges() && !isLoading && (
            <span className="ml-2 text-xs opacity-70">(modifiche in sospeso)</span>
          )}
        </Button>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Modifiche salvate</DialogTitle>
            <DialogDescription className="text-center">
              Le modifiche al profilo sono state applicate correttamente.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSuccessDialog(false)} className="mt-4">
            Chiudi
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
