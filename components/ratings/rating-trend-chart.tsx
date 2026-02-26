'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RatingHistoryEntry } from '@/lib/db/player-ratings'

interface RatingTrendChartProps {
  data: RatingHistoryEntry[]
  title?: string
}

function formatMatchLabel(date: Date, index: number): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short'
  }).format(date)
}

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: RatingHistoryEntry & { match_label: string } }>
}) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm text-muted-foreground">{data.match_label}</p>
      <p className="text-2xl font-bold text-primary">{data.ratingDisplay}</p>
      {data.comment && (
        <p className="text-sm text-muted-foreground mt-1 max-w-48 truncate">
          {data.comment}
        </p>
      )}
    </div>
  )
}

export function RatingTrendChart({ data, title }: RatingTrendChartProps) {
  if (data.length < 3) {
    return null
  }

  const chartData = data.map((entry, index) => ({
    ...entry,
    match_label: formatMatchLabel(entry.matchDate, index),
  }))

  return (
    <Card>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-2">
        <ResponsiveContainer
          width="100%"
          height={200}
          initialDimension={{ width: 300, height: 200 }}
        >
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="match_label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[1, 10]}
              ticks={[1, 3, 5, 6, 7, 8, 10]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={6} stroke="#888" strokeDasharray="5 5" opacity={0.5} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
