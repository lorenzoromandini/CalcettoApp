'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RoleSelector } from '@/components/players/role-selector';
import { Loader2, AlertCircle } from 'lucide-react';
import type { PlayerRole } from '@/lib/db/schema';

interface AvailableJerseyNumbers {
  min: number;
  max: number;
  taken: number[];
  available: number[];
}

interface SetupPlayerFormProps {
  teamId: string;
  teamName: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function SetupPlayerForm({ teamId, teamName, onSuccess, onCancel }: SetupPlayerFormProps) {
  const t = useTranslations('invites');
  const tPlayers = useTranslations('players');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableNumbers, setAvailableNumbers] = useState<AvailableJerseyNumbers | null>(null);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [nickname, setNickname] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState<number>(1);
  const [primaryRole, setPrimaryRole] = useState<PlayerRole | null>(null);
  const [secondaryRoles, setSecondaryRoles] = useState<PlayerRole[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/teams/${teamId}/setup-player`);
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        setAvailableNumbers(data.availableJerseyNumbers);
        
        if (data.player) {
          setName(data.player.name || '');
          setSurname(data.player.surname || '');
          setNickname(data.player.nickname || '');
        }
        
        if (data.availableJerseyNumbers.available.length > 0) {
          setJerseyNumber(data.availableJerseyNumbers.available[0]);
        }
      } catch {
        setError('Failed to load setup data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!primaryRole) {
      setError(t('setup.selectPrimaryRole'));
      return;
    }

    if (!availableNumbers?.available.includes(jerseyNumber)) {
      setError(t('setup.jerseyTaken'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/teams/${teamId}/setup-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          surname: surname || null,
          nickname: nickname || null,
          jerseyNumber,
          primaryRole,
          secondaryRoles,
        }),
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('setup.title', { teamName })}</CardTitle>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{tPlayers('form.name')} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tPlayers('form.namePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">{tPlayers('form.surname')}</Label>
              <Input
                id="surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder={tPlayers('form.surnamePlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">{tPlayers('form.nickname')}</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={tPlayers('form.nicknamePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jerseyNumber">{t('setup.jerseyNumber')} *</Label>
            <div className="flex gap-2">
              <Input
                id="jerseyNumber"
                type="number"
                min={1}
                max={99}
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <div className="flex flex-wrap gap-1">
                {availableNumbers?.available.slice(0, 15).map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={jerseyNumber === num ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setJerseyNumber(num)}
                  >
                    {num}
                  </Button>
                ))}
                {availableNumbers && availableNumbers.available.length > 15 && (
                  <span className="text-xs text-muted-foreground self-center ml-2">
                    +{availableNumbers.available.length - 15} more
                  </span>
                )}
              </div>
            </div>
            {availableNumbers?.taken.length ? (
              <p className="text-xs text-muted-foreground">
                {t('setup.takenNumbers')}: {availableNumbers.taken.join(', ')}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RoleSelector
              primaryRole={primaryRole}
              otherRoles={secondaryRoles}
              onPrimaryRoleChange={setPrimaryRole}
              onOtherRolesChange={setSecondaryRoles}
            />
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {t('setup.primaryRoleWarning')}
            </p>
          </div>

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
              disabled={isSubmitting || !primaryRole || !name}
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
