# Phase 5: Post-Match Statistics - Research

**Created:** 2026-02-17
**Updated:** 2026-02-17
**Research Goal:** Answer "What do I need to know to PLAN this phase well?"

---

## Executive Summary

Phase 5 builds on Phase 4's goal and rating data to provide aggregated player statistics. The core work involves:

1. **Player Statistics Aggregation** — Goals, assists, appearances, wins, losses, draws, average rating, goals conceded (GK)
2. **7 Leaderboards (Top 3)** — Scorers, assists, appearances, wins, losses, MVP, best goalkeeper
3. **Player Profiles** — Individual player pages with full statistics
4. **Match History Integration** — Show scorers on completed match cards
5. **RoleSelector Update** — Separate primary role from other roles

**Key Clarifications:**
- **No team records (W/L/D)** — Teams change each match, players are shuffled
- **Win/Loss/Draw stats are INDIVIDUAL** — Calculated per player based on which team they played on
- **Goals conceded only for goalkeepers** — Must have roles[0] = 'goalkeeper' AND play in GK position
- **All leaderboards show TOP 3**
- **Match sharing via WhatsApp** — Planned for Phase 8

---

## 1. How Teams Work

### Team Assignment in Formation Builder

When creating a match, the formation builder defines two teams:

1. **Home Team (Squadra Casa)** — Left side of the pitch
   - `positionX < 5` in FormationPosition
   
2. **Away Team (Squadra Trasferta)** — Right side of the pitch
   - `positionX >= 5` in FormationPosition

### Schema Change: FormationPosition.side

Add `side` field to track team assignment:

```prisma
model FormationPosition {
  // ... existing fields
  side String? @map("side")  // 'home' | 'away'
}
```

Set when match is completed, based on positionX.

### Win/Loss/Draw Calculation

For each player in a completed match:
- **Win:** Player on home side AND homeScore > awayScore, OR player on away side AND awayScore > homeScore
- **Loss:** Opposite of win
- **Draw:** homeScore = awayScore

---

## 2. Goalkeeper Goals Conceded

### Conditions for Tracking Goals Conceded

A player gets goals conceded counted ONLY if BOTH conditions are met:

1. **Primary role is goalkeeper:** `player.roles[0] = 'goalkeeper'`
2. **Played in GK position:** `FormationPosition.positionLabel = 'GK'`

### Examples

| Player | Primary Role | Position in Match | Goals Conceded? |
|--------|--------------|-------------------|-----------------|
| Marco | goalkeeper | GK (y=6 or y=0) | ✅ Yes |
| Luca | attacker | GK (no GK available) | ❌ No |
| Giuseppe | goalkeeper | DEF (outfield) | ❌ No |

### Calculation

- **Home GK:** goals_conceded = awayScore
- **Away GK:** goals_conceded = homeScore

---

## 3. RoleSelector Update

### Current State

Simple multi-select — all roles are equal in the array.

### New Design

```
┌─────────────────────────────────────┐
│ Ruolo principale *                  │
│ [POR] [DIF] [CEN] [ATT]             │  ← Single select (required)
├─────────────────────────────────────┤
│ Altri ruoli (opzionale)             │
│ [POR] [DIF] [CEN] [ATT]             │  ← Multi-select (optional)
└─────────────────────────────────────┘
```

### Data Storage

- `roles[0]` = primary role (always present)
- `roles[1:]` = other roles (optional)

No schema change needed — just UI/UX update.

---

## 4. 7 Leaderboards (Top 3 Each)

| # | Leaderboard | Value | Sort |
|---|-------------|-------|------|
| 1 | Top Marcatori | Goals | DESC |
| 2 | Top Assist | Assists | DESC |
| 3 | Top Presenze | Appearances | DESC |
| 4 | Top Vittorie | Wins | DESC |
| 5 | Top Sconfitte | Losses | DESC |
| 6 | Top MVP | Avg Rating | DESC |
| 7 | Miglior Portiere | Goals Conceded | ASC (fewer = better) |

---

## 5. Statistics Functions

### lib/db/statistics.ts

```typescript
// Player full statistics
getPlayerStats(playerId, teamId?) → {
  goals, assists, appearances,
  wins, losses, draws,
  goals_conceded, // only for GKs
  avg_rating
}

// 7 Leaderboards (all return top 3)
getTopScorers(teamId, limit=3)
getTopAssisters(teamId, limit=3)
getTopAppearances(teamId, limit=3)
getTopWins(teamId, limit=3)
getTopLosses(teamId, limit=3)
getTopRatedPlayers(teamId, limit=3)
getTopGoalsConceded(teamId, limit=3)  // ASC order

// Match scorers for history
getMatchScorers(matchId)
```

---

## 6. Player Profile Flow

1. User views Roster (`/teams/[teamId]/players`)
2. User clicks on a player card
3. Navigates to profile (`/teams/[teamId]/players/[playerId]`)
4. Profile shows:
   - Player info (name, nickname, avatar, jersey number)
   - Primary role (roles[0])
   - Other roles (roles[1:])
   - Full statistics (goals, assists, appearances, wins, losses, draws, avg rating)
   - Goals conceded (if goalkeeper)

---

## 7. Implementation Complexity

| Feature | Complexity | Risk |
|---------|------------|------|
| Schema change (side field) | Low | Low |
| RoleSelector redesign | Low | Low |
| Player stats aggregation | Medium | Low |
| Win/loss calculation | Medium | Low |
| Goals conceded calculation | Medium | Low |
| Player profile page | Medium | Low |
| 7 leaderboards | Low | Low |
| Scorers on history cards | Low | Low |

**Overall Risk:** LOW — Well-defined scope, existing patterns to follow.

---

## Research Complete
