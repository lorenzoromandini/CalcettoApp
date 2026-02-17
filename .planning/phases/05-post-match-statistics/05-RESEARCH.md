# Phase 5: Post-Match Statistics - Research

**Created:** 2026-02-17
**Updated:** 2026-02-17
**Research Goal:** Answer "What do I need to know to PLAN this phase well?"

---

## Executive Summary

Phase 5 builds on Phase 4's goal and rating data to provide aggregated player statistics. The core work involves:

1. **Player Statistics Aggregation** — Goals, assists, appearances, average rating
2. **Leaderboards** — Top scorers, top assisters, MVP by average rating
3. **Match History Integration** — Show scorers on completed match cards

**Key Insight:** Phase 4 already implemented goals, ratings, and match history display. Phase 5 adds aggregation queries.

**Important Clarifications:**
- **No team records (W/L/D)** — Teams change each match, players are mixed
- **No goalkeeper saves** — Not tracking saves
- **Match sharing via WhatsApp** — Planned for Phase 8 (Social & Sharing)

---

## 1. Current State Analysis

### 1.1 Existing Database Schema (Phase 4 Complete)

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
```

### 1.2 Already Implemented (Phase 4)

| Feature | Status | Location |
|---------|--------|----------|
| Goal CRUD with scorer/assist | ✅ Complete | `lib/db/goals.ts` |
| Rating CRUD with 38-value scale | ✅ Complete | `lib/db/player-ratings.ts` |
| Match lifecycle (status flow) | ✅ Complete | `lib/db/match-lifecycle.ts` |
| Participation tracking | ✅ Complete | `lib/db/player-participation.ts` |
| Match history card display | ✅ Complete | `components/matches/match-history-card.tsx` |
| Completed match detail view | ✅ Complete | `components/matches/completed-match-detail.tsx` |
| Average rating calculation | ✅ Complete | `lib/rating-utils.ts` |

### 1.3 Missing for Phase 5

| Feature | Gap | Priority |
|---------|-----|----------|
| Player career stats aggregation | No aggregation queries exist | HIGH |
| Leaderboards (scorers, assists, MVP) | No queries exist | HIGH |
| Scorers on match history cards | Card doesn't show scorers | MEDIUM |

---

## 2. Technical Research

### 2.1 Statistics Aggregation Patterns

**Player Statistics Query Pattern:**
```typescript
// Goals per player (career)
SELECT scorer_id, COUNT(*) as goals
FROM goals g
JOIN matches m ON g.match_id = m.id
WHERE m.status = 'COMPLETED' AND g.is_own_goal = false
GROUP BY scorer_id

// Assists per player (career)
SELECT assister_id, COUNT(*) as assists
FROM goals g
JOIN matches m ON g.match_id = m.id
WHERE m.status = 'COMPLETED' AND g.assister_id IS NOT NULL
GROUP BY assister_id

// Appearances per player
SELECT mp.player_id, COUNT(*) as appearances
FROM match_players mp
JOIN matches m ON mp.match_id = m.id
WHERE m.status = 'COMPLETED' AND mp.played = true
GROUP BY mp.player_id

// Average rating per player
SELECT pr.player_id, AVG(pr.rating) as avg_rating
FROM player_ratings pr
JOIN matches m ON pr.match_id = m.id
WHERE m.status = 'COMPLETED'
GROUP BY pr.player_id
```

**Prisma Implementation:**
- Use `$queryRaw` for complex aggregations
- Or application-level computation for simpler queries

---

## 3. Component Structure Plan

### New Components Needed

```
components/
├── statistics/
│   ├── player-stats-card.tsx      # Individual player career stats
│   └── player-leaderboard.tsx     # Top scorers, assists, ratings
```

### New Server Actions

```
lib/db/
└── statistics.ts                  # NEW: Aggregation queries
    ├── getPlayerStats(playerId, teamId?)
    ├── getTopScorers(teamId, limit?)
    ├── getTopAssisters(teamId, limit?)
    ├── getTopRatedPlayers(teamId, limit?)
    └── getMatchScorers(matchId)
```

---

## 4. Implementation Complexity Assessment

| Feature | Complexity | Dependencies | Risk |
|---------|------------|--------------|------|
| Player stats aggregation | Medium | None | Low |
| Leaderboards | Low | None | Low |
| Scorers on history cards | Low | None | Low |

**Overall Risk:** LOW — Well-defined scope, existing patterns to follow.

---

## 5. Patterns to Follow

### From Phase 4 (Apply Consistently)

1. **Server Actions:** All mutations in `lib/db/*.ts` with `'use server'`
2. **React Hooks:** Wrap server actions in `hooks/use-*.ts`
3. **Italian First:** Error messages in Italian, translations in `messages/it.json`
4. **Mobile-first:** 48px touch targets, responsive design

---

## 6. Summary for PLAN Phase

### What's Already Done
- ✅ Goal scoring with scorer/assist tracking
- ✅ Player ratings with 38-value scale
- ✅ Match history display
- ✅ Completed match detail view
- ✅ Match lifecycle management
- ✅ Participation tracking

### What Needs Implementation
1. **Statistics Aggregation Layer** — `lib/db/statistics.ts`
2. **Player Stats UI** — Stats card, leaderboard components
3. **Team Stats Page** — `/teams/[teamId]/stats`
4. **Navigation Integration** — Stats tab, scorers on history

### Estimated Scope
- **Files to Create:** ~6-8
- **Files to Modify:** ~4-5
- **Schema Changes:** None
- **New Dependencies:** None

---

## Research Complete
