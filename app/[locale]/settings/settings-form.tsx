'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast.success('Tema aggiornato', {
      description: `Il tema è stato cambiato in ${value === 'light' ? 'chiaro' : value === 'dark' ? 'scuro' : 'sistema'}`,
    });
  };

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error('Errore', {
          description: result.error || 'Si è verificato un errore',
        });
        return;
      }

      toast.success('Password aggiornata', {
        description: 'La password è stata cambiata con successo',
      });
      passwordForm.reset();
    } catch {
      toast.error('Errore', {
        description: 'Si è verificato un errore durante il salvataggio',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label>Tema</Label>
        <Select value={theme} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleziona tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Chiaro</SelectItem>
            <SelectItem value="dark">Scuro</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Scegli come visualizzare l&apos;applicazione
        </p>
      </div>

      <div className="space-y-2">
        <Label>Lingua</Label>
        <p className="text-sm text-muted-foreground">
          La lingua può essere cambiata dal menu di navigazione
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle className="text-lg">Cambia Password</CardTitle>
          </div>
          <CardDescription>
            Aggiorna la tua password per mantenere l&apos;account sicuro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password attuale *</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nuova password *</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register('newPassword')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma nuova password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvataggio...' : 'Aggiorna password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
