'use client'

/**
 * GoalForm Component
 * 
 * A modal/dialog for adding a goal with:
 * - Scorer selector (dropdown from club members)
 * - Assist selector (optional, dropdown)
 * - Own goal checkbox
 * - Add/Cancel buttons
 * 
 * Updated for new schema:
 * - Uses ClubMember instead of Player
 * - Goals link to ClubMember via scorerId (which is clubMemberId)
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

// ============================================================================
// Component Props
// ============================================================================

interface MemberWithUser {
  id: string
  user: {
    first_name: string
    last_name?: string
    nickname?: string | null
    image?: string | null
  } | null
}

interface GoalFormProps {
  matchId: string
  clubId: string
  members: MemberWithUser[]
  onAddGoal: (data: AddGoalInput) => Promise<void>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isLoading?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

function getMemberInitials(firstName: string, lastName?: string | null): string {
  if (lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  return firstName.charAt(0).toUpperCase()
}

function getMemberDisplayName(firstName: string, lastName?: string | null, nickname?: string | null): string {
  if (nickname) return nickname
  if (lastName) return `${firstName} ${lastName}`
  return firstName
}

// ============================================================================
// Component Implementation
// ============================================================================

export function GoalForm({
  matchId,
  clubId,
  members,
  onAddGoal,
  isOpen,
  onOpenChange,
  isLoading = false,
}: GoalFormProps) {
  const t = useTranslations('goals')
  const tCommon = useTranslations('common')

  // Form state
  const [scorerId, setScorerId] = useState<string>('')
  const [assisterId, setAssisterId] = useState<string>('')
  const [isOwnGoal, setIsOwnGoal] = useState(false)

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setScorerId('')
    setAssisterId('')
    setIsOwnGoal(false)
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!scorerId) return

    const data: AddGoalInput = {
      matchId,
      scorerId, // This is clubMemberId
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
          {/* Scorer Selector */}
          <div className="space-y-2">
            <Label htmlFor="scorer">{t('scorer')}</Label>
            <Select value={scorerId} onValueChange={setScorerId}>
              <SelectTrigger id="scorer">
                <SelectValue placeholder={t('selectScorer')} />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="text-xs">
                          {getMemberInitials(member.user?.firstName || 'Unknown', member.user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {getMemberDisplayName(
                          member.user?.firstName || 'Unknown', 
                          member.user?.lastName, 
                          member.user?.nickname
                        )}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Own Goal Checkbox */}
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

          {/* Assist Selector - Only if not own goal */}
          {!isOwnGoal && (
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
                  {members
                    .filter(m => m.id !== scorerId)
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="text-xs">
                              {getMemberInitials(member.user?.firstName || 'Unknown', member.user?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {getMemberDisplayName(
                              member.user?.firstName || 'Unknown', 
                              member.user?.lastName, 
                              member.user?.nickname
                            )}
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
