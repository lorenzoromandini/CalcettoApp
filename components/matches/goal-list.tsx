'use client'

/**
 * GoalList Component
 * 
 * Displays a list of goals with:
 * - Goal number (1st, 2nd, 3rd...)
 * - Scorer name with avatar
 * - Assist (if any) with avatar
 * - Own goal badge (red "Autogol")
 * - Team indicator (our team vs opponent)
 * - Delete button (admin only, only if match not completed)
 */

import { useTranslations } from 'next-intl'
import { Trash2, User, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import type { GoalWithPlayers } from '@/lib/db/goals'

// ============================================================================
// Component Props
// ============================================================================

interface GoalListProps {
  goals: GoalWithPlayers[]
  clubId: string
  canEdit: boolean  // isAdmin && match not completed
  onRemoveGoal: (goalId: string) => Promise<void>
  isLoading?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPlayerInitials(name: string, surname?: string | null): string {
  if (surname) {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}

function getPlayerDisplayName(name: string, surname?: string | null, nickname?: string | null): string {
  if (nickname) return nickname
  if (surname) return `${name} ${surname}`
  return name
}

function getGoalLabel(index: number): string {
  const ordinals = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°']
  if (index < ordinals.length) return ordinals[index]
  return `${index + 1}°`
}

// ============================================================================
// Component Implementation
// ============================================================================

export function GoalList({ 
  goals, 
  clubId, 
  canEdit, 
  onRemoveGoal,
  isLoading = false 
}: GoalListProps) {
  const t = useTranslations('goals')
  const tCommon = useTranslations('common')

  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {goals.map((goal, index) => {
        const isOurGoal = goal.clubId === clubId && !goal.isOwnGoal
        const isOpponentGoal = goal.clubId !== clubId && !goal.isOwnGoal
        const isOwnGoal = goal.isOwnGoal

        return (
          <Card 
            key={goal.id} 
            className={`${isOwnGoal ? 'border-red-500/50 bg-red-50/10 dark:bg-red-950/10' : ''}`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Goal Number */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm sm:text-base font-bold text-primary">
                    {getGoalLabel(index)}
                  </span>
                </div>

                {/* Scorer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Scorer Avatar */}
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarImage src={goal.scorer.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getPlayerInitials(goal.scorer.name, goal.scorer.surname)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Scorer Name */}
                    <span className="font-medium text-sm sm:text-base truncate">
                      {getPlayerDisplayName(
                        goal.scorer.name, 
                        goal.scorer.surname, 
                        goal.scorer.nickname
                      )}
                    </span>

                    {/* Own Goal Badge */}
                    {isOwnGoal && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {t('ownGoal')}
                      </Badge>
                    )}

                    {/* Team Indicator */}
                    {!isOwnGoal && (
                      <Badge 
                        variant={isOurGoal ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {isOurGoal ? t('ourTeam') : t('opponent')}
                      </Badge>
                    )}
                  </div>

                  {/* Assist */}
                  {goal.assister && !isOwnGoal && (
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <span className="text-xs sm:text-sm">{t('assist')}</span>
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                        <AvatarImage src={goal.assister.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-[10px]">
                          {getPlayerInitials(goal.assister.name, goal.assister.surname)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm">
                        {getPlayerDisplayName(
                          goal.assister.name, 
                          goal.assister.surname, 
                          goal.assister.nickname
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                {canEdit && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('removeConfirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('removeConfirm.description')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onRemoveGoal(goal.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {tCommon('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
