'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ClubMember } from '@/types/database';
import { PlayerRole } from '@prisma/client';

// Card types mapping
export type CardType = 
  | 'bronze_base' 
  | 'bronze_rare' 
  | 'silver' 
  | 'golden' 
  | 'if' 
  | 'player_of_the_match' 
  | 'player_of_the_month' 
  | 'ultimate_scream';

interface PlayerCardProps {
  member: ClubMember & { 
    user?: { 
      firstName: string; 
      lastName: string; 
      nickname: string | null; 
      image: string | null;
    } | null 
  };
  clubId: string;
  cardType?: CardType;
  className?: string;
  onClick?: () => void;
}

// Card background images mapping
const CARD_BACKGROUNDS: Record<CardType, string> = {
  bronze_base: '/icons/cards/bronze_base.png',
  bronze_rare: '/icons/cards/bronze_rare.png',
  silver: '/icons/cards/silver.png',
  golden: '/icons/cards/golden.png',
  if: '/icons/cards/if.png',
  player_of_the_match: '/icons/cards/player_of_the_match.png',
  player_of_the_month: '/icons/cards/player_of_the_month.png',
  ultimate_scream: '/icons/cards/ultimate_scream.png',
};

// Card text colors based on card type
const CARD_TEXT_COLORS: Record<CardType, string> = {
  bronze_base: 'text-amber-900',
  bronze_rare: 'text-amber-900',
  silver: 'text-slate-800',
  golden: 'text-yellow-900',
  if: 'text-teal-900',
  player_of_the_match: 'text-blue-900',
  player_of_the_month: 'text-purple-900',
  ultimate_scream: 'text-orange-900',
};

// Determine card type based on member stats/rating
export function getCardType(member: ClubMember): CardType {
  // Placeholder logic - customize based on your rating system
  const hasHighRating = false; // Replace with actual rating check
  const hasSpecialAchievement = false; // Replace with achievement check
  
  if (hasSpecialAchievement) return 'ultimate_scream';
  if (hasHighRating) return 'golden';
  
  // Default based on play time or other criteria
  return 'bronze_base';
}

export function PlayerCard({ 
  member, 
  clubId, 
  cardType: forcedCardType,
  className,
  onClick 
}: PlayerCardProps) {
  const t = useTranslations('players');
  
  const cardType = forcedCardType || getCardType(member);
  const textColor = CARD_TEXT_COLORS[cardType];
  
  // Get player display info
  const firstName = member.user?.firstName || '';
  const lastName = member.user?.lastName || '';
  const nickname = member.user?.nickname;
  const image = member.user?.image;
  const jerseyNumber = member.jerseyNumber;
  const primaryRole = member.primaryRole;
  
  // Get initials for placeholder
  const getInitials = () => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || firstName?.charAt(0).toUpperCase() || '?';
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div 
      className={cn(
        'relative cursor-pointer transition-transform hover:scale-105 active:scale-[0.98]',
        className
      )}
      onClick={handleClick}
    >
      {/* Card Container - maintains aspect ratio */}
      <div className="relative w-full aspect-[3/4]">
        {/* Card Background */}
        <Image
          src={CARD_BACKGROUNDS[cardType]}
          alt="Card background"
          fill
          className="object-cover"
          priority
        />
        
        {/* Player Image Area - positioned in upper 60% */}
        <div className="absolute inset-x-[10%] top-[8%] bottom-[42%] overflow-hidden">
          {image ? (
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={`${firstName} ${lastName}`}
                fill
                className="object-cover object-top"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/20 to-transparent">
              <span className="text-5xl font-bold text-white/60 drop-shadow-lg">
                {getInitials()}
              </span>
            </div>
          )}
        </div>
        
        {/* Jersey Number - positioned in upper-right area */}
        {jerseyNumber > 0 && (
          <div className="absolute top-[12%] right-[8%] z-10">
            <span className="text-2xl font-black text-white drop-shadow-lg">
              {jerseyNumber}
            </span>
          </div>
        )}
        
        {/* Primary Role Icon - positioned in upper-left area */}
        <div className="absolute top-[12%] left-[8%] z-10">
          <RoleIcon role={primaryRole} className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
        
        {/* Player Info Area - positioned in bottom 40% */}
        <div className="absolute inset-x-[5%] bottom-[5%] top-[62%] flex flex-col items-center justify-center text-center p-2">
          {/* Name */}
          <h3 className={cn(
            'font-bold text-base leading-tight truncate w-full',
            textColor
          )}>
            {firstName}
          </h3>
          <h3 className={cn(
            'font-bold text-lg leading-tight truncate w-full',
            textColor
          )}>
            {lastName}
          </h3>
          
          {/* Nickname */}
          {nickname && (
            <p className={cn(
              'text-xs mt-1 truncate w-full opacity-80',
              textColor
            )}>
              &ldquo;{nickname}&rdquo;
            </p>
          )}
          
          {/* Role */}
          <p className={cn(
            'text-xs mt-1 font-medium uppercase tracking-wide opacity-70',
            textColor
          )}>
            {t(`roles.${primaryRole.toLowerCase()}`)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Role icon component
function RoleIcon({ role, className }: { role: PlayerRole; className?: string }) {
  // Simple SVG icons for each role
  const icons: Record<PlayerRole, React.ReactNode> = {
    POR: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    DIF: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    ),
    CEN: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    ),
    ATT: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    ),
  };

  return <>{icons[role]}</>;
}