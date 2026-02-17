# Phase 5: Post-Match Statistics - Research

**Created:** 2026-02-17
**Updated:** 2026-02-17
**Research Goal:** Answer "What do I need to know to PLAN this phase well?"

---

## Executive Summary

Phase 5 builds on Phase 4's goal and rating data to provide aggregated player statistics. The core work involves:

1. **Player Statistics Aggregation** — Goals, assists, appearances, wins, losses, draws, average rating
2. **Leaderboards** — Top scorers, top assists, top appearances, top wins, top losses, MVP
3. **Player Profiles** — Individual player pages with full statistics
4. **Match History Integration** — Show scorers on completed match cards

**Key Insight:** Phase 4 already implemented goals, ratings, and match history display. Phase 5 adds aggregation queries and player profile pages.

**Important Clarifications:**
- **No team records (W/L/D)** — Teams change each match, players are shuffled
- **Win/Loss/Draw stats are INDIVIDUAL** — Calculated per player based on which team they played on
- **Match sharing via WhatsApp** — Planned for Phase 8 (Social & Sharing)

---

## 1. How Teams Work

### Team Assignment in Formation Builder

When creating a match, the formation builder defines two teams:

1. **Home Team (Squadra Casa)** — Left side of the pitch
   - `positionX < 5` in FormationPosition
   
2. **Away Team (Squadra Trasferta)** — Right side of the pitch
   - `positionX >= 5` in FormationPosition

### Schema Change Needed

Add `side` field to `FormationPosition` to track team assignment:

```prisma
model FormationPosition {
  // ... existing fields
  side String? @map("side")  // 'home' | 'away'
}
```

This field is set when the match is completed, based on positionX.

### Win/Loss/Draw Calculation

For each player in a completed match:
- **Win:** Player was on home side AND homeScore > awayScore, OR player was on away side AND awayScore > homeScore
- **Loss:** Opposite of win
- **Draw:** homeScore = awayScore

---

## 2. Current State Analysis

### 2.1 Existing Database Schema (Phase 4 Complete)

```
Match
├── status: SCHEDULED | IN_PROGRESS | FINISHED | COMPLETED | CANCELLED
├── homeScore, awayScore (nullable Int)
├── scheduledAt, location, mode
└── relations: goals[], ratings[], players[], formation

Goal
├── matchId, teamId, scorerId, assisterId (nullable)
├── isOwnGoal: Boolean
├── order: Int (sequential)
└── relations: scorer, assister (Player)

PlayerRating
├── matchId, playerId
├── rating: Decimal(3,2) - stores 38-value scale
├── comment: String (nullable)
└── relations: match, player

MatchPlayer
├── matchId, playerId
├── rsvpStatus, played: Boolean
└── Track who actually played

FormationPosition
├── positionX (0-8), positionY (0-6)
├── playerId
└── isSubstitute
```

### 2.2 Already Implemented (Phase 4)

| Feature | Status | Location |
|---------|--------|----------|
| Goal CRUD with scorer/assist | ✅ Complete | `lib/db/goals.ts` |
| Rating CRUD with 38-value scale | ✅ Complete | `lib/db/player-ratings.ts` |
| Match lifecycle (status flow) | ✅ Complete | `lib/db/match-lifecycle.ts` |
| Participation tracking | ✅ Complete | `lib/db/player-participation.ts` |
| Match history card display | ✅ Complete | `components/matches/match-history-card.tsx` |
| Formation builder | ✅ Complete | `components/formations/*` |
| Roster page | ✅ Complete | `app/[locale]/teams/[teamId]/players/page.tsx` |

### 2.3 Missing for Phase 5

| Feature | Gap | Priority |
|---------|-----|----------|
| FormationPosition.side field | No field to track team assignment | HIGH |
| Player career stats aggregation | No aggregation queries exist | HIGH |
| Win/loss/draw calculation | No queries exist | HIGH |
| Leaderboards | No queries exist | HIGH |
| Player profile page | No page exists | HIGH |
| Scorers on match history cards | Card doesn't show scorers | MEDIUM |

---

## 3. Statistics Functions Needed

### lib/db/statistics.ts

```typescript
// Player full statistics
getPlayerStats(playerId, teamId?) → {
  goals, assists, appearances,
  wins, losses, draws,
  avg_rating
}

// Leaderboards
getTopScorers(teamId, limit?) → [{ player_id, player_name, value }]
getTopAssisters(teamId, limit?) → [...]
getTopAppearances(teamId, limit?) → [...]
getTopWins(teamId, limit?) → [...]
getTopLosses(teamId, limit?) → [...]
getTopRatedPlayers(teamId, limit?) → [...]

// Match scorers
getMatchScorers(matchId) → [{ player_name, count }]
```

---

## 4. Component Structure

### New Components

```
components/statistics/
├── player-stats-card.tsx      # Full player stats display
└── player-leaderboard.tsx     # Top N players by metric
```

### New Pages

```
app/[locale]/teams/[teamId]/
├── players/[playerId]/
│   └── page.tsx               # Player profile with stats
└── stats/
    └── page.tsx               # Team leaderboards
```

### Modified Components

```
components/players/player-card.tsx  → Make clickable, link to profile
components/navigation/team-nav.tsx  → Add Stats tab
components/matches/match-history-card.tsx → Add scorers
```

---

## 5. Player Profile Flow

1. User views Roster page (`/teams/[teamId]/players`)
2. User clicks on a player card
3. Navigates to player profile (`/teams/[teamId]/players/[playerId]`)
4. Profile shows:
   - Player info (name, nickname, avatar, jersey number, roles)
   - Full statistics (goals, assists, appearances, wins, losses, draws, avg rating)

---

## 6. Implementation Complexity

| Feature | Complexity | Dependencies | Risk |
|---------|------------|--------------|------|
| Schema change (side field) | Low | None | Low |
| Player stats aggregation | Medium | None | Low |
| Win/loss calculation | Medium | side field | Low |
| Leaderboards | Low | None | Low |
| Player profile page | Medium | hooks | Low |
| Stats page | Low | components | Low |
| Scorers on history cards | Low | None | Low |

**Overall Risk:** LOW — Well-defined scope, existing patterns to follow.

---

## Research Complete
