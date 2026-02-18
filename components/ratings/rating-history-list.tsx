'use client'

import { Calendar, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RatingHistoryEntry } from '@/lib/db/player-ratings'

interface RatingHistoryListProps {
  data: RatingHistoryEntry[]
  title?: string
  showChart?: boolean
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export function RatingHistoryList({ data, title, showChart = false }: RatingHistoryListProps) {
  if (data.length === 0) {
    return null
  }

  const displayData = showChart && data.length >= 3 ? data : data

  return (
    <Card>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-2">
        <div className="space-y-3">
          {displayData.slice().reverse().map((entry) => (
            <div
              key={entry.match_id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(entry.match_date)}
                </div>
                {entry.comment && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground truncate">
                    <MessageSquare className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{entry.comment}</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-primary ml-4">
                {entry.rating_display}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
