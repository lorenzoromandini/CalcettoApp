'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createPlayerSchema, type CreatePlayerInput } from '@/lib/validations/player';
import { AvatarCropper } from './avatar-cropper';
import { LegacyRoleSelector } from './role-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Upload, X } from 'lucide-react';
import Image from 'next/image';
import type { PlayerRole } from '@/lib/db/schema';

interface PlayerFormProps {
  clubId: string;
  onSubmit: (data: CreatePlayerInput, avatarBlob?: Blob) => Promise<void>;
  onCancel: () => void;
}

export function PlayerForm({ clubId, onSubmit, onCancel }: PlayerFormProps) {
  const t = useTranslations('players');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | undefined>(undefined);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      name: '',
      surname: '',
      nickname: '',
      jersey_number: undefined,
      roles: [],
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
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
    // Create preview URL
    setAvatarImage(URL.createObjectURL(blob));
  }, []);

  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setAvatarImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (data: CreatePlayerInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data, avatarBlob);
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')} *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder={t('form.namePlaceholder')}
              className="h-12"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Surname */}
          <div className="space-y-2">
            <Label htmlFor="surname">{t('form.surname')}</Label>
            <Input
              id="surname"
              {...form.register('surname')}
              placeholder={t('form.surnamePlaceholder')}
              className="h-12"
            />
            {form.formState.errors.surname && (
              <p className="text-sm text-destructive">
                {form.formState.errors.surname.message}
              </p>
            )}
          </div>

          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">{t('form.nickname')}</Label>
            <Input
              id="nickname"
              {...form.register('nickname')}
              placeholder={t('form.nicknamePlaceholder')}
              className="h-12"
            />
            {form.formState.errors.nickname && (
              <p className="text-sm text-destructive">
                {form.formState.errors.nickname.message}
              </p>
            )}
          </div>

          {/* Jersey Number */}
          <div className="space-y-2">
            <Label htmlFor="jersey_number">{t('form.jerseyNumber')}</Label>
            <Input
              id="jersey_number"
              type="number"
              min={1}
              max={99}
              {...form.register('jersey_number', { valueAsNumber: true })}
              placeholder="10"
              className="h-12"
            />
            {form.formState.errors.jerseyNumber && (
              <p className="text-sm text-destructive">
                {form.formState.errors.jerseyNumber.message}
              </p>
            )}
          </div>

{/* Roles - roles[0] = primary role (required), roles[1:] = other roles */}
          <LegacyRoleSelector
            value={form.watch('roles') as PlayerRole[]}
            onChange={(roles) => form.setValue('roles', roles)}
          />
          {form.formState.errors.roles && (
            <p className="text-sm text-destructive">
              {form.formState.errors.roles.message}
            </p>
          )}

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
