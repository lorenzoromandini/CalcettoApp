'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { User, Shield, UserCircle, Zap, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Player, PlayerRole } from '@/lib/db/schema';

interface PlayerCardProps {
  player: Player & { jersey_number?: number };
  clubId: string;
  onClick?: () => void;
}

const ROLE_ICONS: Record<PlayerRole, typeof Shield> = {
  goalkeeper: Shield,
  defender: UserCircle,
  midfielder: Zap,
  attacker: Target,
};

export function PlayerCard({ player, clubId, onClick }: PlayerCardProps) {
  const t = useTranslations('players');

  const getRoleLabel = (role: PlayerRole) => {
    return t(`roles.${role}`);
  };

  // Generate initials for placeholder
  const getInitials = () => {
    const first = player.name?.charAt(0) || '';
    const last = player.surname?.charAt(0) || '';
    return (first + last).toUpperCase() || player.name?.charAt(0).toUpperCase() || '?';
  };

  const playerProfileUrl = `/clubs/${clubId}/players/${player.id}`;

  return (
    <Link href={playerProfileUrl}>
      <Card
        className="cursor-pointer transition-all hover:shadow-lg hover:bg-accent/50 active:scale-[0.98] overflow-hidden group"
        onClick={onClick}
      >
      {/* Card with 3/4 aspect ratio container */}
      <div className="relative aspect-[3/4] w-full">
        {/* Player Image or Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted to-muted/50">
          {player.avatar_url ? (
            <Image
              src={player.avatar_url}
              alt={player.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20">
                <span className="text-3xl font-bold text-primary/60">
                  {getInitials()}
                </span>
              </div>
            </div>
          )}
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Jersey Number - Horizontal, below vertical center, semi-transparent */}
        {player.jersey_number !== undefined && player.jersey_number > 0 && (
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="text-2xl font-black text-white/90 drop-shadow-lg tracking-wider">
                #{player.jersey_number}
              </span>
            </div>
          </div>
        )}

        {/* Player Info - Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Name */}
          <h3 className="font-bold text-white text-lg leading-tight truncate drop-shadow-md">
            {player.name} {player.surname}
          </h3>
          
          {/* Nickname */}
          {player.nickname && (
            <p className="text-white/80 text-sm truncate drop-shadow-md">
              &ldquo;{player.nickname}&rdquo;
            </p>
          )}
          
          {/* Roles */}
          {player.roles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {player.roles.slice(0, 2).map((role) => {
                const Icon = ROLE_ICONS[role as PlayerRole];
                return (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20"
                    title={getRoleLabel(role as PlayerRole)}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{getRoleLabel(role as PlayerRole)}</span>
                  </span>
                );
              })}
              {player.roles.length > 2 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20">
                  +{player.roles.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      </Card>
    </Link>
  );
}
