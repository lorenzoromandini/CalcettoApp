# Phase 6: Rating Trends & History - Research

**Researched:** 2026-02-18
**Domain:** Chart visualization, rating history data aggregation
**Confidence:** HIGH

## Summary

This phase adds rating evolution visualization and history to player profiles. The existing data model (PlayerRating table) already stores all historical ratings with timestamps and match associations. The primary work involves: (1) a new database function to fetch rating history ordered by match date, (2) integrating Recharts for trend visualization, and (3) displaying a rating history list.

**Primary recommendation:** Use Recharts with LineChart in ResponsiveContainer for trend visualization. Fetch rating history via new `getPlayerRatingHistory()` function that joins with matches table to order by `scheduledAt`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^2.12.x | Chart visualization | Most popular React charting library (3.6M+ weekly downloads), declarative API, built on D3 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @recharts/devtools | optional | Debug charts | Development only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | react-chartjs-2 | Canvas rendering (better for large datasets), but more complex API |
| Recharts | Victory | Better responsive defaults, but lower adoption (272k vs 3.6M downloads) |
| Recharts | Nivo | More chart types, but larger bundle size |

**Installation:**
```bash
npm install recharts
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── db/
│   └── player-ratings.ts     # Add getPlayerRatingHistory()
components/
├── ratings/
│   ├── rating-trend-chart.tsx    # Recharts LineChart
│   └── rating-history-list.tsx   # List of past ratings
hooks/
└── use-rating-history.ts         # Data fetching hook
app/[locale]/teams/[teamId]/players/[playerId]/
└── player-profile-client.tsx     # Add chart and history sections
```

### Pattern 1: Rating History Data Fetching
**What:** Fetch all player ratings ordered by match date for trend visualization
**When to use:** Player profile page loads
**Example:**
```typescript
// Source: Based on existing lib/db/player-ratings.ts patterns
export interface RatingHistoryEntry {
  match_id: string
  match_date: Date
  opponent?: string
  rating: number
  rating_display: string
  comment?: string
}

export async function getPlayerRatingHistory(
  playerId: string,
  teamId?: string
): Promise<RatingHistoryEntry[]> {
  const ratings = await prisma.playerRating.findMany({
    where: {
      playerId,
      match: {
        status: MatchStatus.COMPLETED,
        ...(teamId ? { teamId } : {}),
      },
    },
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
    orderBy: {
      match: {
        scheduledAt: 'asc',
      },
    },
  })

  return ratings.map(r => ({
    match_id: r.matchId,
    match_date: r.match.scheduledAt,
    rating: r.rating.toNumber(),
    rating_display: decimalToRating(r.rating.toNumber()),
    comment: r.comment ?? undefined,
  }))
}
```

### Pattern 2: Recharts LineChart for Rating Trends
**What:** Display rating evolution over time with interactive tooltips
**When to use:** Player profile with 2+ ratings
**Example:**
```typescript
// Source: Recharts official docs, adapted for rating trends
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

interface RatingTrendChartProps {
  data: Array<{
    match_date: string
    rating: number
    match_label: string
  }>
}

export function RatingTrendChart({ data }: RatingTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="match_label" 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          domain={[1, 10]} 
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <ReferenceLine y={6} stroke="#888" strokeDasharray="5 5" />
        <Line 
          type="monotone" 
          dataKey="rating" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Pattern 3: ResponsiveContainer with initialDimension
**What:** Prevent width/height warning on first render
**When to use:** Always with ResponsiveContainer in Recharts 2.x/3.x
**Example:**
```typescript
// Avoids "width(-1) and height(-1)" warning
<ResponsiveContainer 
  width="100%" 
  height={250}
  initialDimension={{ width: 300, height: 250 }}
>
```

### Anti-Patterns to Avoid
- **Hardcoding chart dimensions:** Use ResponsiveContainer with aspect or fixed height
- **Fetching all ratings without pagination:** For players with many matches, consider limiting to last N ratings
- **Ignoring mobile touch:** Add `allowEscapeViewBox={{ x: false, y: false }}` to Tooltip to prevent viewport overflow on mobile

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG/Canvas | Recharts | Handles scaling, tooltips, accessibility, responsive sizing |
| Date formatting for chart | Custom date formatter | Intl.DateTimeFormat or date-fns (if already installed) | Locale-aware, handles edge cases |
| Rating display conversion | Manual decimal-to-string | decimalToRating() from lib/rating-utils.ts | Already exists and tested |

**Key insight:** The rating data model is complete. No schema changes needed.

## Common Pitfalls

### Pitfall 1: Recharts ResponsiveContainer Width Warning
**What goes wrong:** Console warning "The width(-1) and height(-1) of chart should be greater than 0"
**Why it happens:** ResponsiveContainer measures parent size asynchronously; on first render, dimensions are undefined
**How to avoid:** Pass `initialDimension` prop or wrap in container with explicit dimensions
**Warning signs:** Warnings in console during development

### Pitfall 2: Mobile Touch Events Not Triggering Tooltips
**What goes wrong:** Tapping on chart data points doesn't show tooltips on iOS/Android
**Why it happens:** Recharts touch handling can conflict with page scroll gestures
**How to avoid:** 
- Use `activeDot` with larger touch target
- Consider disabling scroll on chart container during touch
- Test on actual mobile devices, not just browser devtools
**Warning signs:** Tooltips work on desktop but not on mobile

### Pitfall 3: Rating Scale Display
**What goes wrong:** Y-axis shows wrong values (e.g., 6.125, 6.375) instead of rating scale values
**Why it happens:** Decimal values don't align with visual rating scale
**How to avoid:** Set Y-axis domain to `[1, 10]` and use appropriate tick interval, or use `ticks` prop with rating values
**Warning signs:** Chart shows fractional values between rating increments

### Pitfall 4: Empty State Handling
**What goes wrong:** Chart renders with error or empty space when player has 0-1 ratings
**Why it happens:** LineChart with 0-1 points looks wrong or crashes
**How to avoid:** 
- Show "Not enough data" message for < 2 ratings
- Consider showing single rating as a value display, not a line
**Warning signs:** Chart appears broken for new players

## Code Examples

### Data Transformation for Chart
```typescript
// Transform rating history for Recharts
function transformDataForChart(history: RatingHistoryEntry[]) {
  return history.map((entry, index) => ({
    match_date: entry.match_date.toISOString(),
    match_label: formatMatchLabel(entry.match_date, index),
    rating: entry.rating,
    rating_display: entry.rating_display,
    comment: entry.comment,
  }))
}

function formatMatchLabel(date: Date, index: number): string {
  // Use short date format for x-axis
  return new Intl.DateTimeFormat('it-IT', { 
    day: 'numeric', 
    month: 'short' 
  }).format(date)
}
```

### Custom Tooltip with Rating Display
```typescript
// Source: Recharts tooltip customization pattern
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { rating: number; rating_display: string; match_label: string; comment?: string } }>
}

function RatingTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium">{data.match_label}</p>
      <p className="text-2xl font-bold text-primary">{data.rating_display}</p>
      {data.comment && <p className="text-sm text-muted-foreground mt-1">{data.comment}</p>}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Chart.js wrapper | Native React chart libraries (Recharts, Victory) | ~2020 | Better React integration, hooks support |
| Canvas-only rendering | SVG with optional Canvas | ~2019 | Better accessibility, easier styling with CSS |

**Deprecated/outdated:**
- react-vis: Last updated 2021, consider alternatives
- google-charts React wrappers: Limited customization, external dependency

## Open Questions

1. **Should rating history include match result context?**
   - What we know: Match scores are available in the match table
   - What's unclear: Whether to show W/L/D alongside each rating
   - Recommendation: Include as tooltip enhancement, not required for MVP

2. **Should chart show rolling average?**
   - What we know: Average rating already calculated per player
   - What's unclear: Whether to overlay a rolling average line
   - Recommendation: Defer to future enhancement; start with raw ratings

3. **What's the minimum ratings threshold for showing chart?**
   - What we know: LineChart with 1 point looks wrong
   - What's unclear: Is 2 points enough?
   - Recommendation: Show chart for 3+ ratings, show list view for 1-2 ratings

## Sources

### Primary (HIGH confidence)
- Recharts official docs (recharts.org) - API reference, examples
- Existing codebase: lib/db/player-ratings.ts, lib/rating-utils.ts
- Prisma schema - data model verification

### Secondary (MEDIUM confidence)
- LogRocket blog "Best React chart libraries (2025 update)" - library comparison
- npm-compare.com - download statistics comparison
- GitHub issues #204, #754, #6092 - known mobile touch issues

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts is the most popular React charting library with proven track record
- Architecture: HIGH - Existing data model is complete, patterns follow established codebase conventions
- Pitfalls: MEDIUM - Mobile touch issues documented but may need device testing

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days - stable libraries)
