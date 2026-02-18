'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shirt, Loader2 } from 'lucide-react';

interface TeamWithJersey {
  id: string;
  name: string;
  jerseyNumber: number | null;
  playerId: string | null;
}

export function JerseyNumberSettings() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<TeamWithJersey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadTeams();
    }
  }, [session?.user?.id]);

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/user/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Non fai parte di nessuna squadra.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <Card key={team.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shirt className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{team.name}</CardTitle>
              </div>
            </div>
            <CardDescription>
              Scegli il tuo numero di maglia per questa squadra (1-99)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label>Numero maglia</Label>
                <Select
                  value={team.jerseyNumber?.toString() || ''}
                  onValueChange={(value) => handleJerseyChange(team.id, value)}
                  disabled={savingTeamId === team.id}
                >
                  <SelectTrigger className="w-full">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
