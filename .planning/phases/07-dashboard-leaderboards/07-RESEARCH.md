# Phase 7: Dashboard & Leaderboards - Research

**Researched:** 2026-02-18
**Domain:** Dashboard/Leaderboards with time-based filtering and player evolution charts
**Confidence:** HIGH

## Summary

This phase focuses on enhancing the existing dashboard with leaderboards, player evolution charts, attendance streaks, and time period filtering. The good news: **significant infrastructure already exists** from prior phases (5 and 6).

**Key findings:**
- Leaderboards are already fully implemented in `lib/db/statistics.ts` with 7 leaderboard types
- Stats page at `/teams/[teamId]/stats` already displays all leaderboards using `PlayerLeaderboard` component
- Player profile page with `PlayerStatsCard` and `RatingTrendChart` already exists
- Recharts is already integrated and used for rating history visualization

**Primary recommendation:** Build on existing patterns - integrate leaderboards into main dashboard, add time filtering to existing queries, implement streak calculation using PostgreSQL window functions.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | ^3.7.0 | Charts for player evolution | Already used in Phase 6, composable React components |
| Prisma | ^5.22.0 | Database queries with date filtering | Existing ORM, supports raw queries for streaks |
| shadcn/ui | - | Card, Select, Tabs for UI | Consistent with existing components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.564.0 | Icons for dashboard | Trophy, TrendingUp, Calendar, Flame |
| next-intl | ^4.8.2 | Translations | All user-facing text |

### Existing Components to Reuse
| Component | Location | Purpose |
|-----------|----------|---------|
| `PlayerLeaderboard` | `components/statistics/player-leaderboard.tsx` | Top 3 display with medals |
| `PlayerStatsCard` | `components/statistics/player-stats-card.tsx` | Individual player stats |
| `RatingTrendChart` | `components/ratings/rating-trend-chart.tsx` | LineChart for rating history |
| `useTeamLeaderboards` | `hooks/use-statistics.ts` | Fetches all 7 leaderboards |

**No new packages required.**

## Architecture Patterns

### Recommended Project Structure
```
lib/db/
├── statistics.ts              # Existing - add time-filtered versions
├── player-ratings.ts          # Existing - add evolution queries
└── streaks.ts                 # NEW - attendance streak calculations

hooks/
├── use-statistics.ts          # Existing - add period parameter
├── use-rating-history.ts      # Existing
└── use-player-evolution.ts    # NEW - evolution data hook

components/dashboard/
├── leaderboard-section.tsx    # NEW - main dashboard leaderboards
├── time-period-filter.tsx     # NEW - season/month selector
├── attendance-streak-card.tsx # NEW - streak display
└── player-evolution-chart.tsx # NEW - multi-stat evolution chart

app/[locale]/dashboard/
├── page.tsx                   # Existing - enhance with leaderboards
└── dashboard-client.tsx       # Existing - add new sections
```

### Pattern 1: Time Period Filtering for Statistics

**What:** Add optional date range filtering to existing leaderboard queries.

**When to use:** DASH-07 - filter statistics by season/month.

**Example:**
```typescript
// Extend existing functions in lib/db/statistics.ts
export async function getTopScorers(
  teamId: string,
  limit: number = 3,
  dateRange?: { start: Date; end: Date }  // ADD THIS
): Promise<PlayerLeaderboardEntry[]> {
  const result = await prisma.$queryRaw<{ player_id: string; count: bigint }[]>`
    SELECT 
      g.scorer_id as player_id,
      COUNT(*) as count
    FROM goals g
    JOIN matches m ON g.match_id = m.id
    WHERE m.team_id = ${teamId}
      AND m.status = 'COMPLETED'
      AND g.is_own_goal = false
      ${dateRange ? Prisma.sql`AND m.scheduled_at >= ${dateRange.start} AND m.scheduled_at <= ${dateRange.end}` : Prisma.empty}
    GROUP BY g.scorer_id
    ORDER BY count DESC
    LIMIT ${limit}
  `
  return await enrichLeaderboardEntries(result)
}
```

### Pattern 2: Attendance Streak Calculation

**What:** Calculate consecutive match attendance using SQL window functions.

**When to use:** DASH-06 - display attendance streaks.

**Example:**
```typescript
// NEW FILE: lib/db/streaks.ts
import { prisma } from '@/lib/db'
import { MatchStatus } from '@prisma/client'

export interface AttendanceStreak {
  player_id: string
  player_name: string
  player_avatar?: string
  current_streak: number
  longest_streak: number
}

/**
 * Calculate attendance streaks for team players
 * Uses PostgreSQL window functions for consecutive day detection
 */
export async function getAttendanceStreaks(
  teamId: string,
  limit: number = 5
): Promise<AttendanceStreak[]> {
  // Get all matches in order with players who attended (played=true or rsvp_status='in')
  const result = await prisma.$queryRaw<{
    player_id: string
    current_streak: bigint
    longest_streak: bigint
  }[]>`
    WITH player_matches AS (
      SELECT DISTINCT
        fp.player_id,
        m.scheduled_at::date as match_date
      FROM formation_positions fp
      JOIN formations f ON fp.formation_id = f.id
      JOIN matches m ON f.match_id = m.id
      WHERE m.team_id = ${teamId}
        AND m.status = 'COMPLETED'
        AND fp.player_id IS NOT NULL
        AND fp.side IS NOT NULL
    ),
    streak_groups AS (
      SELECT 
        player_id,
        match_date,
        match_date - (ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY match_date))::int AS grp
      FROM player_matches
    ),
    streaks AS (
      SELECT 
        player_id,
        COUNT(*) as streak_length,
        grp
      FROM streak_groups
      GROUP BY player_id, grp
    ),
    player_streaks AS (
      SELECT 
        player_id,
        MAX(CASE WHEN grp = 0 THEN streak_length ELSE 0 END) as current_streak,
        MAX(streak_length) as longest_streak
      FROM streaks
      GROUP BY player_id
    )
    SELECT player_id, current_streak, longest_streak
    FROM player_streaks
    WHERE current_streak > 0
    ORDER BY current_streak DESC
    LIMIT ${limit}
  `
  
  // Enrich with player names
  // ... similar to enrichLeaderboardEntries pattern
}
```

### Pattern 3: Player Evolution Chart (Multi-Series LineChart)

**What:** Chart showing multiple stats over time for a player.

**When to use:** DASH-08 - player evolution visualization.

**Example:**
```typescript
// components/dashboard/player-evolution-chart.tsx
'use client'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EvolutionDataPoint {
  match_date: string
  goals: number
  assists: number
  rating: number | null
}

interface PlayerEvolutionChartProps {
  data: EvolutionDataPoint[]
  title?: string
}

export function PlayerEvolutionChart({ data, title }: PlayerEvolutionChartProps) {
  if (data.length < 2) {
    return null  // Need at least 2 data points
  }

  return (
    <Card>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="match_date" 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="goals"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Goals"
            />
            <Line
              type="monotone"
              dataKey="assists"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Assists"
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Rating"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Pattern 4: Time Period Selector Component

**What:** Reusable filter for season/month selection.

**Example:**
```typescript
// components/dashboard/time-period-filter.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type TimePeriod = 'all' | 'season' | 'month' | 'last3months'

interface TimePeriodFilterProps {
  value: TimePeriod
  onChange: (value: TimePeriod) => void
}

export function TimePeriodFilter({ value, onChange }: TimePeriodFilterProps) {
  const t = useTranslations('dashboard')

  const getPeriodDates = (period: TimePeriod): { start: Date; end: Date } | undefined => {
    const now = new Date()
    switch (period) {
      case 'month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        }
      case 'last3months':
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
          end: now,
        }
      case 'season':
        // Assume season runs September to June (European football calendar)
        const seasonStart = now.getMonth() >= 8 
          ? new Date(now.getFullYear(), 8, 1)
          : new Date(now.getFullYear() - 1, 8, 1)
        return {
          start: seasonStart,
          end: now,
        }
      default:
        return undefined
    }
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('period.all_time')}</SelectItem>
        <SelectItem value="season">{t('period.season')}</SelectItem>
        <SelectItem value="last3months">{t('period.last_3_months')}</SelectItem>
        <SelectItem value="month">{t('period.this_month')}</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

### Anti-Patterns to Avoid
- **Re-fetching all data on period change:** Use React state and filter client-side for small datasets, or memoize server queries
- **Building separate dashboard per team:** Single dashboard with team selector
- **Creating new chart components from scratch:** Extend existing `RatingTrendChart` pattern
- **Ignoring existing statistics.ts:** Extend existing functions, don't duplicate

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Leaderboard display | Custom leaderboard component | `PlayerLeaderboard` | Already has medals, avatars, loading states |
| Rating chart | Custom chart | `RatingTrendChart` | Already styled, handles <3 data points |
| Stats display | Custom stats grid | `PlayerStatsCard` | Already handles GK stats, ratings |
| Date formatting | Custom formatter | `Intl.DateTimeFormat` | Built-in, locale-aware |

**Key insight:** The project already has strong component patterns. Extend rather than recreate.

## Common Pitfalls

### Pitfall 1: Incorrect Streak Calculation
**What goes wrong:** Counting non-consecutive matches as streak.
**Why it happens:** Not using window functions correctly, missing date ordering.
**How to avoid:** Use `ROW_NUMBER()` with `date - row_number` technique for consecutive group detection.
**Warning signs:** Streaks don't reset after missed matches.

### Pitfall 2: Time Zone Issues in Date Filtering
**What goes wrong:** Matches at midnight UTC excluded from local date range.
**Why it happens:** Not accounting for timezone when filtering by date.
**How to avoid:** Use `scheduled_at::date` in PostgreSQL to compare dates, or include timezone offset in filter.
**Warning signs:** Different results when viewing from different timezones.

### Pitfall 3: Missing Statistics for Filtered Periods
**What goes wrong:** Empty leaderboards when filtering by time period.
**Why it happens:** Not returning all-time data as fallback.
**How to avoid:** Show "No data for this period" message, suggest switching to all-time view.
**Warning signs:** Users confused why leaderboards are empty.

### Pitfall 4: Evolution Chart with Sparse Data
**What goes wrong:** Chart looks wrong with few data points.
**Why it happens:** Recharts doesn't handle sparse data gracefully.
**How to avoid:** Same pattern as `RatingTrendChart` - return `null` for < 2 data points, show alternative view.
**Warning signs:** Charts with 1-2 points look broken.

## Code Examples

### Extend useTeamLeaderboards with Time Period

```typescript
// hooks/use-statistics.ts - extend existing hook
export function useTeamLeaderboards(
  teamId: string | null,
  dateRange?: { start: Date; end: Date }  // ADD OPTIONAL PARAMETER
): UseTeamLeaderboardsReturn {
  // ... existing implementation, pass dateRange to query functions
  const [
    scorers,
    assisters,
    // ...
  ] = await Promise.all([
    getTopScorers(teamId, 3, dateRange),  // Pass date range
    getTopAssisters(teamId, 3, dateRange),
    // ...
  ])
}
```

### Query Player Evolution Data

```typescript
// lib/db/player-evolution.ts - NEW FILE
import { prisma } from '@/lib/db'
import { MatchStatus } from '@prisma/client'

export interface EvolutionDataPoint {
  match_date: string
  match_id: string
  goals: number
  assists: number
  rating: number | null
  result: 'win' | 'loss' | 'draw'
}

export async function getPlayerEvolution(
  playerId: string,
  teamId: string,
  limit: number = 10
): Promise<EvolutionDataPoint[]> {
  // Get matches where player participated
  const positions = await prisma.formationPosition.findMany({
    where: {
      playerId,
      formation: {
        match: {
          teamId,
          status: MatchStatus.COMPLETED,
        },
      },
      side: { not: null },
    },
    include: {
      formation: {
        include: {
          match: {
            select: {
              id: true,
              scheduledAt: true,
              homeScore: true,
              awayScore: true,
            },
          },
        },
      },
    },
    orderBy: {
      formation: {
        match: {
          scheduledAt: 'asc',
        },
      },
    },
    take: limit,
  })

  // For each match, get goals, assists, rating
  // ... implementation details
}
```

### Dashboard Integration Pattern

```typescript
// components/dashboard/leaderboard-section.tsx
'use client'

import { useTeamLeaderboards } from '@/hooks/use-statistics'
import { PlayerLeaderboard } from '@/components/statistics/player-leaderboard'
import { TimePeriodFilter, type TimePeriod } from './time-period-filter'
import { useState, useMemo } from 'react'

interface LeaderboardSectionProps {
  teamId: string
}

export function LeaderboardSection({ teamId }: LeaderboardSectionProps) {
  const [period, setPeriod] = useState<TimePeriod>('all')
  
  const dateRange = useMemo(() => {
    // Convert period to date range
    return period === 'all' ? undefined : getDateRangeForPeriod(period)
  }, [period])

  const { leaderboards, isLoading } = useTeamLeaderboards(teamId, dateRange)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Leaderboards</h2>
        <TimePeriodFilter value={period} onChange={setPeriod} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlayerLeaderboard
          title="Top Scorers"
          entries={leaderboards.scorers}
          valueLabel="Goals"
          isLoading={isLoading}
        />
        {/* ... other leaderboards */}
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded time periods | Configurable season/month filters | This phase | More flexible data exploration |
| Single leaderboard view | Dashboard-integrated leaderboards | This phase | Better discoverability |
| Static stats display | Evolution charts over time | Phase 6 → This phase | Trend visualization |

**Deprecated/outdated:**
- Moment.js for dates: Native `Date` and `Intl.DateTimeFormat` are sufficient
- Custom chart libraries: Recharts is already integrated and sufficient

## Open Questions

1. **Season Definition**
   - What we know: Need "season" filter option
   - What's unclear: Does season mean Sep-Jun (European), calendar year, or configurable?
   - Recommendation: Default to Sep-Jun, make configurable per team in future

2. **Streak Definition**
   - What we know: Need attendance streak display
   - What's unclear: Does "attendance" mean RSVP'd 'in', actually played, or both?
   - Recommendation: Use `side IS NOT NULL` (actually played in match) - matches statistics pattern

3. **Evolution Chart Metrics**
   - What we know: Need player evolution charts
   - What's unclear: Which metrics to show? Goals/assists/rating? Or include wins/appearances?
   - Recommendation: Goals, assists, rating as primary (3 lines max for clarity)

## Sources

### Primary (HIGH confidence)
- Existing codebase files (statistics.ts, player-leaderboard.tsx, rating-trend-chart.tsx, player-stats-card.tsx)
- Prisma documentation for date filtering
- Recharts documentation for multi-series LineChart

### Secondary (MEDIUM confidence)
- SQL streak calculation patterns from Stack Overflow and Medium articles
- PostgreSQL window function documentation

### Tertiary (LOW confidence)
- Web search for fantasy sports dashboard patterns (general guidance only)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components already exist in codebase
- Architecture: HIGH - Clear patterns established in Phases 5-6
- Pitfalls: MEDIUM - Streak calculation has edge cases

**Research date:** 2026-02-18
**Valid until:** 30 days - stable patterns, no rapidly changing dependencies

---

## Implementation Priorities

Based on requirements, here's the recommended implementation order:

1. **DASH-07 Time Period Filter** - Foundation for filtering all stats
   - Add `dateRange` parameter to existing statistics functions
   - Create `TimePeriodFilter` component
   - Integrate with existing hooks

2. **DASH-01 to DASH-04 Dashboard Leaderboards** - Integrate existing leaderboards
   - Create `LeaderboardSection` component for main dashboard
   - Reuse `PlayerLeaderboard` component
   - Add time period filtering

3. **DASH-06 Attendance Streaks** - New calculation
   - Create `lib/db/streaks.ts` with window function query
   - Create `AttendanceStreakCard` component
   - Add to dashboard

4. **DASH-05 Enhanced Player Profile** - Already exists
   - Verify all requirements met
   - Add evolution chart if not present

5. **DASH-08 Player Evolution Charts** - New visualization
   - Create `lib/db/player-evolution.ts`
   - Create `PlayerEvolutionChart` component
   - Add to player profile page

**Dependencies on prior phases:**
- Phase 4: Match completion and formation positions (required for streaks)
- Phase 5: Statistics aggregation functions (extend for time filtering)
- Phase 6: Rating history and charts (extend for evolution)
