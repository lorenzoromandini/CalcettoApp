'use client'

/**
 * Match Status Badge Component
 * 
 * Displays match status with Italian labels and appropriate color coding.
 * 
 * Color coding:
 * - SCHEDULED (Programmata): secondary (gray)
 * - IN_PROGRESS (In corso): default (blue/primary)
 * - FINISHED (Terminata): outline with yellow border
 * - COMPLETED (Completata): success (green)
 * - CANCELLED (Cancellata): destructive (red)
 */

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import type { MatchStatus } from '@/lib/db/schema'

// ============================================================================
// Status Configuration
// ============================================================================

interface StatusConfig {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
  className?: string
}

const getStatusConfig = (t: (key: string) => string, status: MatchStatus): StatusConfig => {
  switch (status) {
    case 'SCHEDULED':
      return {
        label: t('status.scheduled'),
        variant: 'secondary',
      }
    case 'IN_PROGRESS':
      return {
        label: t('status.inProgress'),
        variant: 'default',
        className: 'bg-blue-500 hover:bg-blue-600',
      }
    case 'FINISHED':
      return {
        label: t('status.finished'),
        variant: 'outline',
        className: 'border-yellow-500 text-yellow-600 dark:text-yellow-500',
      }
    case 'COMPLETED':
      return {
        label: t('status.completed'),
        variant: 'success',
      }
    case 'CANCELLED':
      return {
        label: t('status.cancelled'),
        variant: 'destructive',
      }
    default:
      return {
        label: status,
        variant: 'secondary',
      }
  }
}

// ============================================================================
// Component Props
// ============================================================================

interface MatchStatusBadgeProps {
  status: MatchStatus
  className?: string
}

// ============================================================================
// Component Implementation
// ============================================================================

export function MatchStatusBadge({ status, className }: MatchStatusBadgeProps) {
  const t = useTranslations('matches')
  const config = getStatusConfig(t, status)

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className || ''} ${className || ''}`}
    >
      {config.label}
    </Badge>
  )
}
