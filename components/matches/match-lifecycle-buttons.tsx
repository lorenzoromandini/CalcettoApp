'use client'

/**
 * Match Lifecycle Buttons Component
 * 
 * Shows different action buttons based on match status:
 * - SCHEDULED: "Start Match" (primary) + "Final Results" (secondary)
 * - IN_PROGRESS: "End Match" button
 * - FINISHED: "Complete Match" button
 * - COMPLETED: Nothing (read-only)
 * 
 * Only visible to team admins.
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Play, Square, CheckCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useMatchLifecycle } from '@/hooks/use-match-lifecycle'
import type { MatchStatus } from '@/lib/db/schema'

// ============================================================================
// Component Props
// ============================================================================

interface MatchLifecycleButtonsProps {
  matchId: string
  teamId: string
  status: MatchStatus
  isAdmin: boolean
  homeScore?: number
  awayScore?: number
}

// ============================================================================
// Component Implementation
// ============================================================================

export function MatchLifecycleButtons({
  matchId,
  teamId,
  status,
  isAdmin,
  homeScore,
  awayScore,
}: MatchLifecycleButtonsProps) {
  const t = useTranslations('matches')
  const tCommon = useTranslations('common')
  const { isLoading, startMatch, endMatch, completeMatch, inputFinalResults } = 
    useMatchLifecycle(matchId, teamId)
  
  // State for Final Results dialog
  const [finalResultsOpen, setFinalResultsOpen] = useState(false)
  const [homeInput, setHomeInput] = useState(homeScore?.toString() ?? '0')
  const [awayInput, setAwayInput] = useState(awayScore?.toString() ?? '0')

  // Don't render if completed (read-only) or user is not admin
  if (status === 'COMPLETED' || !isAdmin) {
    return null
  }

  /**
   * Handle Final Results submission
   */
  const handleFinalResults = () => {
    const home = parseInt(homeInput, 10)
    const away = parseInt(awayInput, 10)
    
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0 || home > 99 || away > 99) {
      return
    }
    
    inputFinalResults(home, away)
    setFinalResultsOpen(false)
  }

  // SCHEDULED: Show Start Match + Final Results buttons
  if (status === 'SCHEDULED') {
    return (
      <div className="flex flex-wrap gap-2">
        {/* Start Match Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isLoading} className="gap-2">
              <Play className="h-4 w-4" />
              {t('lifecycle.startMatch')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('lifecycle.startMatchConfirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('lifecycle.startMatchConfirm.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={startMatch} disabled={isLoading}>
                {t('lifecycle.startMatch')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Final Results Button */}
        <AlertDialog open={finalResultsOpen} onOpenChange={setFinalResultsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="secondary" disabled={isLoading} className="gap-2">
              <FileText className="h-4 w-4" />
              {t('lifecycle.finalResults')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('lifecycle.finalResultsConfirm.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('lifecycle.finalResultsConfirm.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {/* Score Input */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="homeScore">{t('lifecycle.homeScore')}</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  max="99"
                  value={homeInput}
                  onChange={(e) => setHomeInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayScore">{t('lifecycle.awayScore')}</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  max="99"
                  value={awayInput}
                  onChange={(e) => setAwayInput(e.target.value)}
                />
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinalResults} disabled={isLoading}>
                {t('lifecycle.saveResults')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // IN_PROGRESS: Show End Match button
  if (status === 'IN_PROGRESS') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary" disabled={isLoading} className="gap-2">
            <Square className="h-4 w-4" />
            {t('lifecycle.endMatch')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('lifecycle.endMatchConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('lifecycle.endMatchConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={endMatch} disabled={isLoading}>
              {t('lifecycle.endMatch')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // FINISHED: Show Complete Match button
  if (status === 'FINISHED') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isLoading} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {t('lifecycle.completeMatch')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('lifecycle.completeMatchConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('lifecycle.completeMatchConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={completeMatch} disabled={isLoading}>
              {t('lifecycle.completeMatch')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return null
}
