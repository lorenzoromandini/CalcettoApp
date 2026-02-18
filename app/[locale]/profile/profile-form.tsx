'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileSchema, type ProfileInput } from '@/lib/validations/auth';

interface ProfileFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    nickname: string | null;
    email: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Errore durante il salvataggio');
      }

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
        />
        <p className="text-xs text-muted-foreground">
          L&apos;email non può essere modificata
        </p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvataggio...' : 'Salva modifiche'}
      </Button>
    </form>
  );
}
