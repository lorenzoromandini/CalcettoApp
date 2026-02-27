'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { FrameBorderColor, DashboardMemberData } from '@/lib/db/player-ratings'

interface DashboardPlayerCardProps {
  data: DashboardMemberData
  locale: string
  className?: string
}

const FRAME_COLORS: Record<FrameBorderColor, { border: string; glow: string; ring: string }> = {
  gray: {
    border: 'border-gray-300 dark:border-gray-600',
    glow: '',
    ring: 'ring-gray-200 dark:ring-gray-700',
  },
  bronze: {
    border: 'border-amber-700 dark:border-amber-600',
    glow: 'shadow-[0_0_15px_rgba(180,83,9,0.4)]',
    ring: 'ring-amber-600/30',
  },
  silver: {
    border: 'border-slate-400 dark:border-slate-300',
    glow: 'shadow-[0_0_15px_rgba(148,163,184,0.5)]',
    ring: 'ring-slate-300/30',
  },
  gold: {
    border: 'border-yellow-500 dark:border-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
    ring: 'ring-yellow-400/30',
  },
  platinum: {
    border: 'border-cyan-300 dark:border-cyan-200',
    glow: 'shadow-[0_0_25px_rgba(103,232,249,0.6)]',
    ring: 'ring-cyan-200/40',
  },
  'fire-red': {
    border: 'border-red-500 dark:border-red-400',
    glow: 'shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse',
    ring: 'ring-red-400/40',
  },
}

function getInitials(name: string, surname: string | null): string {
  const first = name?.charAt(0) || ''
  const last = surname?.charAt(0) || ''
  return (first + last).toUpperCase() || name?.charAt(0).toUpperCase() || '?'
}

export function DashboardPlayerCard({ data, locale, className }: DashboardPlayerCardProps) {
  const { member, clubId, teamName, jerseyNumber, frameColor } = data
  const colors = FRAME_COLORS[frameColor]

  console.log('[DashboardPlayerCard] Received data:', {
    jerseyNumber,
    jerseyNumberType: typeof jerseyNumber,
    jerseyNumberValue: jerseyNumber,
    condition: jerseyNumber && jerseyNumber > 0
  })

  const profileUrl = clubId
    ? `/clubs/${clubId}/players/${member.id}`
    : `/players/${member.id}`

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      // Naviga alla pagina del profilo
      window.location.href = profileUrl;
      
      // Dopo la navigazione, nascondi l'URL completo
      setTimeout(() => {
        window.history.replaceState({}, '', '/player');
      }, 100);
    }
  }

  return (
    <div 
      onClick={handleClick}
      className={cn('flex flex-col items-center group cursor-pointer', className)}
    >
      <div
        className={cn(
          'relative w-24 aspect-[3/4] rounded-lg overflow-hidden',
          'border-4 transition-all duration-300',
          'ring-2',
          colors.border,
          colors.glow,
          colors.ring,
          'group-hover:scale-105'
        )}
      >
        {member.image ? (
          <Image
            src={member.image}
            alt={member.firstName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">
              {getInitials(member.firstName, member.lastName)}
            </span>
          </div>
        )}

        {jerseyNumber && jerseyNumber > 0 && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border-2 border-current flex items-center justify-center shadow-md text-xs font-bold">
            #{jerseyNumber}
          </div>
        )}
      </div>

    </div>
  )
}

export function DashboardPlayerCardSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 aspect-[3/4] rounded-lg bg-muted animate-pulse border-4 border-muted" />
      <div className="mt-2 space-y-1">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
