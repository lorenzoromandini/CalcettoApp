'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RoleSelector } from '@/components/players/role-selector';
import { AvatarCropper } from '@/components/players/avatar-cropper';
import { resizeImage } from '@/lib/image-utils';
import { Loader2, AlertCircle, Upload, User } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';
import { PlayerRole } from '@prisma/client';

interface AvailableJerseyNumbers {
  min: number;
  max: number;
  taken: number[];
  available: number[];
}

interface SetupPlayerFormProps {
  clubId: string;
  clubName: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function SetupPlayerForm({ clubId, clubName, onSuccess, onCancel }: SetupPlayerFormProps) {
  const t = useTranslations('invites');
  const tPlayers = useTranslations('players');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableNumbers, setAvailableNumbers] = useState<AvailableJerseyNumbers | null>(null);
  const [jerseyNumber, setJerseyNumber] = useState<number | ''>('');
  const [primaryRole, setPrimaryRole] = useState<PlayerRole | null>(null);
  const [secondaryRoles, setSecondaryRoles] = useState<PlayerRole[]>([]);
  
  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch(`/api/clubs/${clubId}/setup-player`);
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        setAvailableNumbers(data.availableJerseyNumbers);
        
        if (data.userAvatar) {
          setAvatarPreview(data.userAvatar);
        }
        
        // Non impostare automaticamente il numero, lascia vuoto così l'utente deve scegliere
      } catch {
        setError('Failed to load setup data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resizedBlob = await resizeImage(file, 1024, 1024);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(resizedBlob);
    } catch {
      setError('Errore nel caricamento dell immagine');
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setCroppedAvatar(croppedBlob);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setShowCropper(false);
    };
    reader.readAsDataURL(croppedBlob);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!primaryRole) {
      setError(t('setup.selectPrimaryRole'));
      return;
    }

    if (typeof jerseyNumber !== 'number' || !availableNumbers?.available.includes(jerseyNumber)) {
      setError(t('setup.jerseyTaken'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('jerseyNumber', jerseyNumber.toString());
      formData.append('primaryRole', primaryRole);
      formData.append('secondaryRoles', JSON.stringify(secondaryRoles));
      
      if (croppedAvatar) {
        formData.append('avatar', croppedAvatar, 'avatar.jpg');
      }

      const res = await authFetch(`/api/clubs/${clubId}/setup-player`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to setup player');
        return;
      }

      onSuccess();
    } catch {
      setError('Failed to setup player');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (showCropper && avatarPreview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tPlayers('avatar.cropTitle')}</CardTitle>
          <CardDescription>{tPlayers('avatar.cropDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarCropper
            image={avatarPreview}
            onCropComplete={handleCropComplete}
            onCancel={() => setShowCropper(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('setup.title', { clubName })}</CardTitle>
        <CardDescription>{t('setup.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <Label className="text-center">{tPlayers('avatar.title')}</Label>
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground/30">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 cursor-pointer"
              >
                <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {tPlayers('avatar.optional')}
            </p>
          </div>

          {/* Numero maglia - Solo input manuale */}
          <div className="space-y-2">
            <Label htmlFor="jerseyNumber">{t('setup.jerseyNumber')} *</Label>
            <Input
              id="jerseyNumber"
              type="number"
              min={1}
              max={99}
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 1)}
              className="w-full h-16 text-3xl text-center font-bold"
              placeholder="99"
            />
            <p className="text-xs text-muted-foreground text-center">
              Inserisci un numero da 1 a 99
            </p>
          </div>

          {/* Selezione ruoli */}
          <div className="space-y-2">
            <RoleSelector
              primaryRole={primaryRole}
              otherRoles={secondaryRoles}
              onPrimaryRoleChange={setPrimaryRole}
              onOtherRolesChange={setSecondaryRoles}
            />
          </div>

          {/* Bottoni */}
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                {t('setup.skip')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !primaryRole}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('setup.submitting')}
                </>
              ) : (
                t('setup.submit')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
