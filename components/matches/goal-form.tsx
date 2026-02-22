'use client'

/**
 * GoalForm Component
 * 
 * A modal/dialog for adding a goal with:
 * - Team selector (Our Team / Opponent)
 * - Scorer selector (dropdown from team players)
 * - Assist selector (optional, dropdown)
 * - Own goal checkbox
 * - Add/Cancel buttons
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { AddGoalInput } from '@/lib/db/goals'
import type { Player } from '@/lib/db/schema'

// ============================================================================
// Component Props
// ============================================================================

interface GoalFormProps {
  matchId: string
  clubId: string
  players: Player[]
  onAddGoal: (data: AddGoalInput) => Promise<void>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
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

// ============================================================================
// Component Implementation
// ============================================================================

export function GoalForm({
  matchId,
  clubId,
  players,
  onAddGoal,
  isOpen,
  onOpenChange,
  isLoading = false,
}: GoalFormProps) {
  const t = useTranslations('goals')
  const tCommon = useTranslations('common')

  // Form state
  const [selectedTeam, setSelectedTeam] = useState<'our' | 'opponent'>('our')
  const [scorerId, setScorerId] = useState<string>('')
  const [assisterId, setAssisterId] = useState<string>('')
  const [isOwnGoal, setIsOwnGoal] = useState(false)

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setSelectedTeam('our')
    setScorerId('')
    setAssisterId('')
    setIsOwnGoal(false)
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!scorerId) return

    // For opponent goals without a specific scorer, use a placeholder
    // In this case, we'll create a virtual opponent goal
    const clubIdForGoal = selectedTeam === 'our' ? clubId : `opponent-${matchId}`

    const data: AddGoalInput = {
      matchId,
      clubId: clubIdForGoal,
      scorerId,
      assisterId: assisterId || undefined,
      isOwnGoal,
    }

    try {
      await onAddGoal(data)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      // Error handled by parent hook
    }
  }

  /**
   * Handle dialog close
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  // Filter players based on team selection
  // For opponent goals, we don't have specific players, so we need a different approach
  // Let's show all players and mark who scored
  const availableScorers = selectedTeam === 'our' ? players : []

  // Disable assist if own goal is checked
  const isAssistDisabled = isOwnGoal

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addGoal')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addGoal')}</DialogTitle>
          <DialogDescription>
            {t('addGoalDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Team Selector */}
          <div className="space-y-2">
            <Label>{t('selectTeam')}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedTeam === 'our' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setSelectedTeam('our')
                  setScorerId('')
                  setAssisterId('')
                }}
              >
                {t('ourTeam')}
              </Button>
              <Button
                type="button"
                variant={selectedTeam === 'opponent' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setSelectedTeam('opponent')
                  // For opponent, we don't have specific players
                  // Use a placeholder scorer ID
                  setScorerId('opponent-placeholder')
                }}
              >
                {t('opponent')}
              </Button>
            </div>
          </div>

          {/* Scorer Selector - Only for our team */}
          {selectedTeam === 'our' && (
            <div className="space-y-2">
              <Label htmlFor="scorer">{t('scorer')}</Label>
              <Select value={scorerId} onValueChange={setScorerId}>
                <SelectTrigger id="scorer">
                  <SelectValue placeholder={t('selectScorer')} />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={player.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getPlayerInitials(player.name, player.surname)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {getPlayerDisplayName(player.name, player.surname, player.nickname)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Opponent Goal Info */}
          {selectedTeam === 'opponent' && (
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              {t('opponentGoalNote')}
            </div>
          )}

          {/* Own Goal Checkbox - Only for our team */}
          {selectedTeam === 'our' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ownGoal"
                checked={isOwnGoal}
                onCheckedChange={(checked) => {
                  setIsOwnGoal(checked as boolean)
                  if (checked) {
                    setAssisterId('') // Clear assist for own goals
                  }
                }}
              />
              <Label
                htmlFor="ownGoal"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 text-destructive" />
                {t('ownGoal')}
              </Label>
            </div>
          )}

          {/* Assist Selector - Only for our team and not own goal */}
          {selectedTeam === 'our' && !isOwnGoal && (
            <div className="space-y-2">
              <Label htmlFor="assister">{t('assister')} ({t('optional')})</Label>
              <Select 
                value={assisterId} 
                onValueChange={setAssisterId}
                disabled={isAssistDisabled}
              >
                <SelectTrigger id="assister">
                  <SelectValue placeholder={t('selectAssister')} />
                </SelectTrigger>
                <SelectContent>
                  {/* Don't show scorer as assister option */}
                  {players
                    .filter(p => p.id !== scorerId)
                    .map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={player.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {getPlayerInitials(player.name, player.surname)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {getPlayerDisplayName(player.name, player.surname, player.nickname)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !scorerId}
          >
            {isLoading ? t('adding') : t('addGoal')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
