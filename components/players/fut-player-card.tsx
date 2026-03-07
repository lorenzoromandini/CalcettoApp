'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ClubMember } from '@/types/database';
import { PlayerRole } from '@prisma/client';
import { Star } from 'lucide-react';
import cardSpaces from '@/lib/card-spaces.json';
import { useRef, useState, useEffect } from 'react';

// Card types from JSON config
export type CardType = 
  | 'bronze_base' 
  | 'bronze_rare' 
  | 'silver' 
  | 'golden' 
  | 'if' 
  | 'player_of_the_match' 
  | 'player_of_the_month'
  | 'ultimate_scream'
  | 'absent';

interface PlayerCardProps {
  member: ClubMember & { 
    user?: { 
      firstName: string; 
      lastName: string; 
      nickname: string | null; 
      image: string | null;
    } | null;
    club?: {
      image: string | null;
    } | null;
  };
  clubId: string;
  cardType?: CardType;
  className?: string;
  onClick?: () => void;
  lastMatchRating?: number | null;
  hasMvpInLastMatch?: boolean;
  isAbsent?: boolean;
}

// Original card dimensions from JSON
const ORIGINAL_WIDTH = cardSpaces.layout.dimensions.width;
const ORIGINAL_HEIGHT = cardSpaces.layout.dimensions.height;

// Determine card type based on member stats/rating
export interface CardTypeCriteria {
  lastMatchRating?: number | null;
  hasMvpInLastMatch?: boolean;
  isAbsent?: boolean;
}

export function getCardType(criteria: CardTypeCriteria): CardType {
  const { lastMatchRating, hasMvpInLastMatch, isAbsent } = criteria;
  
  if (isAbsent) return 'absent';
  if (hasMvpInLastMatch) return 'player_of_the_match';
  
  if (lastMatchRating !== null && lastMatchRating !== undefined) {
    if (lastMatchRating >= 8.0) return 'if';
    if (lastMatchRating >= 7.0) return 'golden';
    if (lastMatchRating >= 6.0) return 'silver';
    if (lastMatchRating > 4.5) return 'bronze_rare';
  }
  
  return 'bronze_base';
}

// Role abbreviations
const ROLE_ABBREVIATIONS: Record<PlayerRole, string> = {
  POR: 'POR',
  DIF: 'DIF',
  CEN: 'CEN',
  ATT: 'ATT',
};

// Helper to find region by ID
function findRegion(id: string) {
  return cardSpaces.regions.find(r => r.id === id);
}

export function PlayerCard({ 
  member, 
  clubId, 
  cardType: forcedCardType,
  className,
  onClick,
  lastMatchRating,
  hasMvpInLastMatch,
  isAbsent
}: PlayerCardProps) {
  const t = useTranslations('players');
  const cardRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  
  // Calculate scale factor when card resizes
  useEffect(() => {
    const updateScale = () => {
      if (cardRef.current) {
        const displayedWidth = cardRef.current.offsetWidth;
        const scale = displayedWidth / ORIGINAL_WIDTH;
        setScaleFactor(scale);
      }
    };
    
    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);
  
  const cardType = forcedCardType || getCardType({ lastMatchRating, hasMvpInLastMatch, isAbsent });
  const cardConfig = cardSpaces.cardTypeConfig[cardType as keyof typeof cardSpaces.cardTypeConfig];
  
  // Determine text color - all same color per card type, white for player_of_the_match
  const textColor = cardType === 'player_of_the_match' 
    ? '#FFFFFF' 
    : (cardConfig?.textColor || '#000000');
  
  // Get player display info
  const firstName = member.user?.firstName || '';
  const lastName = member.user?.lastName || '';
  const nickname = member.user?.nickname;
  const image = member.user?.image;
  const jerseyNumber = member.jerseyNumber;
  const primaryRole = member.primaryRole;
  const secondaryRoles = member.secondaryRoles || [];
  const symbol = member.symbol;
  const clubImage = member.club?.image;
  
  // Get display name (nickname or abbreviated first name + full last name)
  const getAbbreviatedFirstName = () => {
    if (!firstName) return '';
    return firstName.charAt(0).toUpperCase() + '.';
  };
  
  const displayName = nickname || `${getAbbreviatedFirstName()} ${lastName}`.trim();
  
  // Get initials for placeholder
  const getInitials = () => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || firstName?.charAt(0).toUpperCase() || '?';
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  // Find regions from JSON config
  const playerPhotoRegion = findRegion('player-photo');
  const playerNameRegion = findRegion('player-name');
  const playerRatingRegion = findRegion('player-rating');
  const jerseyNumberRegion = findRegion('jersey-number');
  const primaryRoleRegion = findRegion('primary-role');
  const secondaryRolesRegion = findRegion('secondary-roles');
  const clubLogoRegion = findRegion('club-logo');
  const playerSymbolRegion = findRegion('player-symbol');
  const privilegeIconRegion = findRegion('privilege-icon');

  // Get scaled dimensions for a region
  const getScaledDimensions = (bounds: { x: number | null; y: number | null; width: number | null; height: number | null } | undefined) => {
    if (!bounds || bounds.x === null || bounds.y === null || bounds.width === null || bounds.height === null) {
      return null;
    }
    return {
      x: bounds.x * scaleFactor,
      y: bounds.y * scaleFactor,
      width: bounds.width * scaleFactor,
      height: bounds.height * scaleFactor,
      minDimension: Math.min(bounds.width * scaleFactor, bounds.height * scaleFactor),
    };
  };

  // Convert original pixel bounds to scaled CSS
  const getScaledStyle = (bounds: { x: number | null; y: number | null; width: number | null; height: number | null } | undefined): React.CSSProperties => {
    const dims = getScaledDimensions(bounds);
    if (!dims) return {};
    return {
      position: 'absolute',
      left: `${dims.x}px`,
      top: `${dims.y}px`,
      width: `${dims.width}px`,
      height: `${dims.height}px`,
    };
  };

  // Get font size based on shortest dimension of the region - fill the shorter dimension
  const getRegionFontSize = (bounds: { x: number | null; y: number | null; width: number | null; height: number | null } | undefined, fillRatio: number = 0.8): string => {
    const dims = getScaledDimensions(bounds);
    if (!dims) return '16px';
    // Fill the shorter dimension
    return `${dims.minDimension * fillRatio}px`;
  };

  // Common text shadow style for all text elements
  const textShadowStyle = cardType === 'player_of_the_match'
    ? '0 2px 4px rgba(0,0,0,0.8)'
    : '0 1px 2px rgba(0,0,0,0.5)';

  return (
    <div 
      ref={cardRef}
      className={cn(
        'relative cursor-pointer transition-transform hover:scale-105 active:scale-[0.98]',
        className
      )}
      onClick={handleClick}
    >
      {/* Card Container - maintains aspect ratio */}
      <div className="relative w-full aspect-[3/4]">
        {/* Card Background from JSON config */}
        <Image
          src={cardConfig?.backgroundImage || '/icons/cards/bronze_base.png'}
          alt="Card background"
          fill
          className="object-cover"
          priority
        />
        
        {/* Club Logo */}
        {clubImage && clubLogoRegion && clubLogoRegion.bounds?.x !== null && (
          <div 
            className="z-30 flex items-center justify-center overflow-hidden"
            style={getScaledStyle(clubLogoRegion.bounds)}
          >
            <div className="relative w-full h-full">
              <Image
                src={clubImage}
                alt="Club"
                fill
                className="object-contain rounded-full"
              />
            </div>
          </div>
        )}
        
        {/* Player Rating - fills shorter dimension */}
        {lastMatchRating !== null && lastMatchRating !== undefined && playerRatingRegion && playerRatingRegion.bounds?.x !== null && (
          <div 
            className="z-20 flex items-start justify-center overflow-hidden"
            style={{
              ...getScaledStyle(playerRatingRegion.bounds),
              padding: 0,
              margin: 0,
              lineHeight: 1,
            }}
          >
            <span 
              className="font-black leading-none"
              style={{
                color: textColor,
                fontSize: getRegionFontSize(playerRatingRegion.bounds, 0.75),
                textShadow: textShadowStyle,
                padding: 0,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {lastMatchRating.toFixed(1)}
            </span>
          </div>
        )}
        
        {/* Jersey Number - with jersey PNG background */}
        {jerseyNumber > 0 && jerseyNumberRegion && jerseyNumberRegion.bounds?.x !== null && (
          <div 
            className="z-20 flex items-center justify-center overflow-hidden"
            style={getScaledStyle(jerseyNumberRegion.bounds)}
          >
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Jersey PNG Background - scaled down using CSS transform */}
              <Image
                src="/icons/cards/jersey.png"
                alt="Jersey"
                fill
                className="object-contain brightness-0 invert"
                style={{ transform: 'scale(0.8)', transformOrigin: 'center center' }}
              />
              {/* Jersey Number - centered on top */}
              <span 
                className="absolute font-black z-10"
                style={{
                  color: textColor,
                  fontSize: getRegionFontSize(jerseyNumberRegion.bounds, 0.35),
                  lineHeight: '1',
                  textShadow: textShadowStyle,
                }}
              >
                {jerseyNumber}
              </span>
            </div>
          </div>
        )}
        
        {/* Primary Role - fills shorter dimension with rectangle border */}
        {primaryRoleRegion && primaryRoleRegion.bounds?.x !== null && (
          <div 
            className="z-20 flex items-center justify-center overflow-hidden"
            style={{
              ...getScaledStyle(primaryRoleRegion.bounds),
              border: `2px solid ${textColor}`,
              borderRadius: '4px',
              backgroundColor: cardType === 'player_of_the_match' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
            }}
          >
            <span 
              className="font-black whitespace-nowrap"
              style={{ 
                color: textColor,
                fontSize: getRegionFontSize(primaryRoleRegion.bounds, 0.65),
                textShadow: textShadowStyle,
              }}
            >
              {ROLE_ABBREVIATIONS[primaryRole]}
            </span>
          </div>
        )}
        
        {/* Secondary Roles - fills shorter dimension */}
        {secondaryRoles.length > 0 && secondaryRolesRegion && secondaryRolesRegion.bounds?.x !== null && (
          <div 
            className="z-20 flex items-center justify-center overflow-hidden"
            style={getScaledStyle(secondaryRolesRegion.bounds)}
          >
            <span 
              className="font-bold whitespace-nowrap"
              style={{ 
                color: textColor,
                fontSize: getRegionFontSize(secondaryRolesRegion.bounds, 0.6),
                textShadow: textShadowStyle,
                opacity: 0.9,
              }}
            >
              {secondaryRoles.slice(0, 2).map(r => ROLE_ABBREVIATIONS[r]).join(', ')}
            </span>
          </div>
        )}
        
        {/* Symbol - fills shorter dimension */}
        {symbol && playerSymbolRegion && playerSymbolRegion.bounds?.x !== null && (
          <div 
            className="z-20 flex items-center justify-center overflow-hidden"
            style={getScaledStyle(playerSymbolRegion.bounds)}
          >
            <span 
              className="font-bold"
              style={{
                color: textColor,
                fontSize: getRegionFontSize(playerSymbolRegion.bounds, 0.7),
                textShadow: textShadowStyle,
              }}
            >
              {symbol}
            </span>
          </div>
        )}
        
        {/* Privilege Icon - displays OWNER/MANAGER/MEMBER badge */}
        {member.privileges && privilegeIconRegion && privilegeIconRegion.bounds?.x !== null && (
          <div 
            className="z-30 flex items-center justify-center"
            style={{
              ...getScaledStyle(privilegeIconRegion.bounds),
              overflow: 'visible',
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={`/icons/privileges/${member.privileges.toLowerCase()}.png`}
                alt={member.privileges}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
        
        {/* Player Photo - fills the entire region */}
        {playerPhotoRegion && playerPhotoRegion.bounds?.x !== null && (
          <div 
            className="z-10 overflow-hidden"
            style={getScaledStyle(playerPhotoRegion.bounds)}
          >
            {image ? (
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt={displayName}
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'center top' }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span 
                  className="font-bold"
                  style={{ 
                    color: textColor,
                    fontSize: getRegionFontSize(playerPhotoRegion.bounds, 0.5),
                    textShadow: textShadowStyle,
                  }}
                >
                  {getInitials()}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Player Name - fills shorter dimension */}
        {playerNameRegion && playerNameRegion.bounds?.x !== null && (
          <div 
            className="z-20 flex items-center justify-center overflow-hidden"
            style={getScaledStyle(playerNameRegion.bounds)}
          >
            <h3 
              className={cn(
                'font-black text-center uppercase tracking-wide truncate w-full'
              )}
              style={{
                color: textColor,
                fontSize: getRegionFontSize(playerNameRegion.bounds, 0.55),
                textShadow: textShadowStyle,
              }}
            >
              {displayName}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}