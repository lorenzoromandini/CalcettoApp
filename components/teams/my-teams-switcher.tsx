'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeams } from '@/hooks/use-teams';
import type { Team } from '@/lib/db/schema';

interface MyTeamsSwitcherProps {
  currentTeamId?: string;
  locale: string;
}

export function MyTeamsSwitcher({ currentTeamId, locale }: MyTeamsSwitcherProps) {
  const t = useTranslations('teams');
  const router = useRouter();
  const { teams, isLoading } = useTeams();
  const [open, setOpen] = useState(false);

  const currentTeam = teams.find((t: Team) => t.id === currentTeamId);

  const handleTeamSelect = (teamId: string) => {
    setOpen(false);
    if (teamId !== currentTeamId) {
      router.push(`/${locale}/teams/${teamId}`);
    }
  };

  const handleCreateTeam = () => {
    setOpen(false);
    router.push(`/${locale}/teams/create`);
  };

  if (isLoading) {
    return (
      <Button variant="ghost" disabled className="h-12 px-3">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="ml-2 h-4 w-24 bg-muted animate-pulse rounded" />
      </Button>
    );
  }

  if (teams.length === 0) {
    return (
      <Button
        variant="outline"
        onClick={handleCreateTeam}
        className="h-12"
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('createFirst')}
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 px-3 justify-start gap-2 w-full max-w-[280px]"
        >
          {currentTeam?.image_url ? (
            <img
              src={currentTeam.image_url}
              alt={currentTeam.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {currentTeam?.name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-medium truncate">
              {currentTeam?.name || t('selectTeam')}
            </p>
            <p className="text-xs text-muted-foreground">
              {teams.length} {teams.length === 1 ? t('team') : t('teams')}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel>{t('myTeams')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {teams.map((team: Team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => handleTeamSelect(team.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {team.image_url ? (
              <img
                src={team.image_url}
                alt={team.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {team.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${team.id === currentTeamId ? 'font-medium' : ''}`}>
                {team.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('member', { count: 1 })}
              </p>
            </div>
            {team.id === currentTeamId && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateTeam}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">{t('createNew')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
