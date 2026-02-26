'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { LegacyRoleSelector } from './role-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Upload, X } from 'lucide-react';
import Image from 'next/image';
import type { PlayerRole } from '@/types/database';

// Local form type - simpler than the full schema
interface PlayerFormData {
  jersey_number: number | undefined;
  primary_role: PlayerRole;
  secondary_roles: PlayerRole[];
}

interface PlayerFormProps {
  clubId: string;
  onSubmit: (data: { jersey_number: number; primary_role: PlayerRole; secondary_roles: PlayerRole[] }, avatarBlob?: Blob) => Promise<void>;
  onCancel: () => void;
}

export function PlayerForm({ clubId, onSubmit, onCancel }: PlayerFormProps) {
  const t = useTranslations('players');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | undefined>(undefined);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PlayerFormData>({
    defaultValues: {
      jersey_number: undefined,
      primary_role: 'CEN',
      secondary_roles: [],
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('avatar.errorType'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(t('avatar.errorSize'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }, [t]);

  const handleCropComplete = useCallback((blob: Blob) => {
    setAvatarBlob(blob);
    setShowCropper(false);
    setAvatarImage(URL.createObjectURL(blob));
  }, []);

  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setAvatarImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (data: PlayerFormData) => {
    if (!data.jersey_number) {
      alert(t('form.jerseyNumberRequired'));
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        jersey_number: data.jersey_number,
        primary_role: data.primary_role,
        secondary_roles: data.secondary_roles,
      }, avatarBlob);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCropper && avatarImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('avatar.cropTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Avatar cropper placeholder</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('create.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>{t('form.avatar')}</Label>
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
                    onClick={() => {
                      setAvatarImage(null);
                      setAvatarBlob(undefined);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
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
                  <Button type="button" variant="outline" className="h-12" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {avatarImage ? t('avatar.change') : t('avatar.upload')}
                    </span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('avatar.hint')}
                </p>
              </div>
            </div>
          </div>

          {/* Jersey Number */}
          <div className="space-y-2">
            <Label htmlFor="jersey_number">{t('form.jerseyNumber')} *</Label>
            <Input
              id="jersey_number"
              type="number"
              min={1}
              max={99}
              {...form.register('jersey_number', { valueAsNumber: true })}
              placeholder="10"
              className="h-12"
            />
            {form.formState.errors.jersey_number && (
              <p className="text-sm text-destructive">
                {form.formState.errors.jersey_number.message}
              </p>
            )}
          </div>

          {/* Primary Role */}
          <div className="space-y-2">
            <Label>{t('form.primaryRole')} *</Label>
            <LegacyRoleSelector
              value={[form.watch('primary_role')]}
              onChange={(roles) => form.setValue('primary_role', roles[0] || 'CEN')}
            />
          </div>

          {/* Secondary Roles */}
          <div className="space-y-2">
            <Label>{t('form.secondaryRoles')}</Label>
            <LegacyRoleSelector
              value={form.watch('secondary_roles') || []}
              onChange={(roles) => form.setValue('secondary_roles', roles)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={onCancel}
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('form.saving') : t('form.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
