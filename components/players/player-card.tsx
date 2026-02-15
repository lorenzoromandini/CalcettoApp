'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { User, Shield, UserCircle, Zap, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Player, PlayerRole } from '@/lib/db/schema';

interface PlayerCardProps {
  player: Player & { jersey_number?: number };
  onClick?: () => void;
}

const ROLE_ICONS: Record<PlayerRole, typeof Shield> = {
  goalkeeper: Shield,
  defender: UserCircle,
  midfielder: Zap,
  attacker: Target,
};

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const t = useTranslations('players');

  const getRoleLabel = (role: PlayerRole) => {
    return t(`roles.${role}`);
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative h-16 w-16 shrink-0">
            {player.avatar_url ? (
              <Image
                src={player.avatar_url}
                alt={player.name}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            {/* Jersey Number Badge */}
            {player.jersey_number !== undefined && player.jersey_number > 0 && (
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                {player.jersey_number}
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {player.name} {player.surname}
            </h3>
            {player.nickname && (
              <p className="text-sm text-muted-foreground truncate">
                &ldquo;{player.nickname}&rdquo;
              </p>
            )}
            
            {/* Roles */}
            {player.roles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {player.roles.map((role) => {
                  const Icon = ROLE_ICONS[role];
                  return (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary"
                      title={getRoleLabel(role)}
                    >
                      <Icon className="h-3 w-3" />
                      {getRoleLabel(role)}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
