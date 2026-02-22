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
import { useClubs } from '@/hooks/use-clubs';
import type { Club } from '@/lib/db/schema';

interface MyClubsSwitcherProps {
  currentClubId?: string;
  locale: string;
}

export function MyClubsSwitcher({ currentClubId, locale }: MyClubsSwitcherProps) {
  const t = useTranslations('clubs');
  const router = useRouter();
  const { clubs, isLoading } = useClubs();
  const [open, setOpen] = useState(false);

  const currentClub = clubs.find((c: Club) => c.id === currentClubId);

  const handleClubSelect = (clubId: string) => {
    setOpen(false);
    if (clubId !== currentClubId) {
      router.push(`/${locale}/clubs/${clubId}`);
    }
  };

  const handleCreateClub = () => {
    setOpen(false);
    router.push(`/${locale}/clubs/create`);
  };

  if (isLoading) {
    return (
      <Button variant="ghost" disabled className="h-12 px-3">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="ml-2 h-4 w-24 bg-muted animate-pulse rounded" />
      </Button>
    );
  }

  if (clubs.length === 0) {
    return (
      <Button
        variant="outline"
        onClick={handleCreateClub}
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
          {currentClub?.image_url ? (
            <img
              src={currentClub.image_url}
              alt={currentClub.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {currentClub?.name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-medium truncate">
              {currentClub?.name || t('selectClub')}
            </p>
            <p className="text-xs text-muted-foreground">
              {clubs.length} {clubs.length === 1 ? t('club') : t('clubs')}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel>{t('myClubs')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {clubs.map((club: Club) => (
          <DropdownMenuItem
            key={club.id}
            onClick={() => handleClubSelect(club.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {club.image_url ? (
              <img
                src={club.image_url}
                alt={club.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${club.id === currentClubId ? 'font-medium' : ''}`}>
                {club.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('member', { count: 1 })}
              </p>
            </div>
            {club.id === currentClubId && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateClub}
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
