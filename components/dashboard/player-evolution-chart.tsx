'use client'

/**
 * Player Evolution Chart Component
 *
 * Multi-line Recharts visualization showing goals, assists, and rating trends.
 * Returns null for less than 2 data points (minimum for trend visualization).
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { EvolutionDataPoint } from '@/lib/db/player-evolution'

interface PlayerEvolutionChartProps {
  data: EvolutionDataPoint[]
  title?: string
}

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; payload: EvolutionDataPoint }>
}) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm text-muted-foreground mb-2">{data.match_label}</p>
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <p key={i} className="text-sm">
            <span className="font-medium capitalize">{entry.dataKey}:</span>{' '}
            {entry.dataKey === 'rating' && data.rating_display
              ? data.rating_display
              : entry.value}
          </p>
        ))}
      </div>
    </div>
  )
}

export function PlayerEvolutionChart({ data, title }: PlayerEvolutionChartProps) {
  // Need at least 2 data points for meaningful trend
  if (data.length < 2) {
    return null
  }

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
          height={250}
          initialDimension={{ width: 300, height: 250 }}
        >
          <LineChart
            data={data}
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
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="goals"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3, fill: '#ef4444' }}
              name="Gol"
            />
            <Line
              type="monotone"
              dataKey="assists"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#3b82f6' }}
              name="Assist"
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ r: 3, fill: '#eab308' }}
              name="Voto"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
