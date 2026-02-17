# Phase 5: Post-Match Statistics - Research

**Created:** 2026-02-17
**Research Goal:** Answer "What do I need to know to PLAN this phase well?"

---

## Executive Summary

Phase 5 builds on Phase 4's goal and rating data to provide aggregated statistics and match photo uploads. The core work involves:

1. **Statistics Aggregation** - Leverage existing Goal and PlayerRating models
2. **Match Photo Uploads** - New feature requiring client-side compression
3. **Win/Loss/Draw Records** - Calculate from existing match scores
4. **Player Career Stats** - Aggregate goals, assists, appearances across matches

**Key Insight:** Phase 4 already implemented goals, ratings, and match history display. Phase 5 adds aggregation queries and photo uploads.

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

Formation + FormationPosition
└── Visual formation storage
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
| Match score calculation | ✅ Complete | `lib/db/goals.ts:updateMatchScore` |

### 1.3 Missing for Phase 5

| Feature | Gap | Priority |
|---------|-----|----------|
| Player career stats aggregation | No aggregation queries exist | HIGH |
| Team W/L/D record calculation | No aggregation exists | HIGH |
| Goals per match average | No calculation exists | MEDIUM |
| Goalkeeper saves tracking | No database field exists | MEDIUM |
| Match photo upload | No storage, no UI | HIGH |
| Photo compression | No library installed | HIGH |
| Lazy loading for images | Partial (Next.js Image) | LOW |

---

## 2. Technical Research

### 2.1 Statistics Aggregation Patterns

**Approach:** SQL aggregation via Prisma's `$queryRaw` or computed fields.

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

**Team Record Query Pattern:**
```typescript
// Win/Loss/Draw record
SELECT 
  SUM(CASE WHEN home_score > away_score THEN 1 ELSE 0 END) as wins,
  SUM(CASE WHEN home_score < away_score THEN 1 ELSE 0 END) as losses,
  SUM(CASE WHEN home_score = away_score THEN 1 ELSE 0 END) as draws
FROM matches
WHERE team_id = ? AND status = 'COMPLETED'
```

**Prisma Implementation Options:**
1. **`$queryRaw`** - Direct SQL for complex aggregations
2. **Application-level** - Fetch all matches, compute in JS (simpler, less efficient)
3. **Database views** - Pre-computed views (requires migration)

**Recommendation:** Use `$queryRaw` for aggregations; add computed fields to Player model if needed for caching.

### 2.2 Image Upload & Compression

**Library:** `browser-image-compression` (2.0.x)

**Installation:**
```bash
npm install browser-image-compression
```

**Usage Pattern:**
```typescript
import imageCompression from 'browser-image-compression'

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,                    // Max 1MB output
    maxWidthOrHeight: 1920,          // Max dimension
    useWebWorker: true,              // Non-blocking
    fileType: 'image/jpeg',          // Convert to JPEG
    initialQuality: 0.85             // 85% quality
  }
  
  return await imageCompression(file, options)
}
```

**Existing Pattern Reference:**
- `lib/image-utils.ts` already has `getCroppedImg` and `resizeImage` using Canvas API
- Can extend or use browser-image-compression for better compression

**Upload Destination Options:**
1. **Base64 in database** - Simple, but bloats DB (current pattern for avatars)
2. **File system** - Not viable for serverless
3. **Cloud storage** - Cloudinary, Supabase Storage, S3

**Current Pattern:** Avatars stored as base64 strings (`avatarUrl: String?`)
**Issue:** Match photos are larger, multiple per match - base64 not ideal

**Recommendation:** 
- For MVP: Continue base64 pattern (simple, works)
- Future: Add Supabase Storage or Cloudinary for CDN benefits

### 2.3 Lazy Loading

**Next.js 15 Image Component:**
```tsx
import Image from 'next/image'

<Image 
  src={photoUrl}
  alt="Match highlight"
  width={400}
  height={300}
  loading="lazy"  // Default
  placeholder="blur"
/>
```

**For Dynamic Images (base64):**
- Use `loading="lazy"` on `<img>` tags
- Intersection Observer for custom lazy loading
- React Suspense boundaries

**Recommendation:** Use Next.js Image for static, native `loading="lazy"` for dynamic base64 images.

### 2.4 Goalkeeper Saves (STAT-02)

**Current State:** No saves field exists.

**Options:**
1. **Add `saves` field to MatchPlayer** - `saves: Int` (default 0)
2. **Add `saves` to Goal model** - Goal with type='save' (hacky)
3. **New GoalkeeperStats model** - Separate tracking

**Recommendation:** Add `saves: Int` to MatchPlayer for simplicity.
```prisma
model MatchPlayer {
  // ... existing fields
  saves Int @default(0) @map("saves")  // Add this
}
```

---

## 3. Requirements Mapping

### STAT-01: Match Statistics Display
- **Status:** Partial - goals/ratings displayed in match detail
- **Gap:** Aggregated totals view per match
- **Implementation:** Extend `CompletedMatchDetail` with summary stats

### STAT-02: Goalkeeper Saves
- **Status:** Not implemented
- **Gap:** No database field, no UI
- **Implementation:** Add `saves` field, input in rating flow

### STAT-03: Player Statistics Aggregation
- **Status:** Not implemented
- **Gap:** No aggregation queries
- **Implementation:** New `lib/db/statistics.ts` with aggregation functions

### STAT-04: Match History
- **Status:** ✅ Complete (Phase 4)
- **Note:** `MatchHistoryCard` and `CompletedMatchDetail` already exist

### STAT-05: Win/Loss/Draw Records
- **Status:** Not implemented
- **Gap:** Team record calculation
- **Implementation:** New aggregation function + UI component

### STAT-06: Goals Per Match Average
- **Status:** Not implemented
- **Gap:** Calculation function
- **Implementation:** Simple division (total goals / total matches)

### STAT-07: Match Photo Upload
- **Status:** Not implemented
- **Gap:** Storage, compression, UI
- **Implementation:** New `MatchPhoto` model, upload component

### STAT-08: Client-Side Image Compression
- **Status:** Partial - existing canvas utilities
- **Gap:** browser-image-compression library not installed
- **Implementation:** Install library, create upload flow

### UIUX-07: Lazy Loading
- **Status:** Partial - Next.js Image used for some images
- **Gap:** Not applied to match photos (don't exist yet)
- **Implementation:** Apply in photo gallery component

---

## 4. Database Schema Additions Needed

### Option A: Minimal Changes

```prisma
// Add to MatchPlayer (for goalkeeper saves)
model MatchPlayer {
  // ... existing
  saves Int @default(0)  // NEW: Goalkeeper saves
}

// Add to Match (for photos as JSON)
model Match {
  // ... existing
  photos Json?  // NEW: Array of { url: string, caption?: string }
}
```

### Option B: Full Photo Model

```prisma
model MatchPhoto {
  id        String   @id @default(cuid())
  matchId   String   @map("match_id")
  url       String   // Base64 or storage URL
  caption   String?
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  match Match @relation(fields: [matchId], references: [id], onDelete: Cascade)

  @@index([matchId])
  @@map("match_photos")
}

// Update Match relation
model Match {
  // ... existing
  photos MatchPhoto[]
}
```

**Recommendation:** Option A for MVP (JSON array), Option B for full implementation.

---

## 5. Component Structure Plan

### New Components Needed

```
components/
├── statistics/
│   ├── player-stats-card.tsx      # Individual player career stats
│   ├── team-record-badge.tsx      # W/L/D display
│   ├── player-leaderboard.tsx     # Top scorers, assists, ratings
│   └── stats-summary.tsx          # Aggregated team stats
│
├── matches/
│   ├── match-photo-uploader.tsx   # Photo upload with compression
│   ├── match-photo-gallery.tsx    # Photo gallery with lazy loading
│   └── match-stats-summary.tsx    # Per-match aggregated stats
│
└── players/
    └── player-profile-stats.tsx   # Full player statistics view
```

### New Server Actions

```
lib/db/
├── statistics.ts                  # NEW: Aggregation queries
│   ├── getPlayerStats(playerId)
│   ├── getTeamRecord(teamId)
│   ├── getTopScorers(teamId, limit)
│   ├── getTopAssisters(teamId, limit)
│   └── getMVPs(teamId, limit)
│
└── match-photos.ts               # NEW: Photo CRUD
    ├── uploadMatchPhoto(matchId, file)
    ├── deleteMatchPhoto(photoId)
    └── getMatchPhotos(matchId)
```

---

## 6. Implementation Complexity Assessment

| Feature | Complexity | Dependencies | Risk |
|---------|------------|--------------|------|
| Player stats aggregation | Medium | None | Low |
| Team W/L/D record | Low | None | Low |
| Goals per match average | Low | None | Low |
| Match photo upload | Medium | browser-image-compression | Medium |
| Photo compression | Low | New library | Low |
| Goalkeeper saves | Low | Schema migration | Low |
| Lazy loading | Low | None | Low |
| Player profile stats page | Medium | Aggregation queries | Low |

**Overall Risk:** LOW - Well-defined scope, existing patterns to follow.

---

## 7. Key Decisions for PLAN Phase

### D1: Photo Storage Strategy
- **Option A:** Base64 in database (like avatars) - Simple, no new infra
- **Option B:** Supabase Storage / Cloudinary - CDN benefits, better for many photos
- **Recommendation for PLAN:** Option A for MVP, document Option B as future enhancement

### D2: Statistics Computation
- **Option A:** Compute on-demand (query each time)
- **Option B:** Cache in database (PlayerStats model)
- **Recommendation for PLAN:** Option A (simpler, acceptable for small user base)

### D3: Goalkeeper Saves Input
- **Option A:** Part of rating flow (admin enters saves)
- **Option B:** Separate "match stats" section
- **Recommendation for PLAN:** Part of rating flow, only show for goalkeepers

### D4: Statistics Page Location
- **Option A:** Dashboard statistics section
- **Option B:** Separate `/statistics` route
- **Option C:** Player profile page
- **Recommendation for PLAN:** All three - dashboard highlights, player profiles, dedicated page

---

## 8. Dependencies & Installation

```bash
# Required new package
npm install browser-image-compression

# Already installed (reuse)
# - react-hook-form (forms)
# - zod (validation)
# - sonner (toast notifications)
# - @radix-ui/* (UI components)
```

---

## 9. Patterns to Follow

### From Phase 4 (Apply Consistently)

1. **Server Actions:** All mutations in `lib/db/*.ts` with `'use server'`
2. **React Hooks:** Wrap server actions in `hooks/use-*.ts`
3. **Italian First:** Error messages in Italian, translations in `messages/it.json`
4. **Optimistic UI:** Use `useState` + rollback on error
5. **Permission Checks:** `isTeamAdmin()` before mutations
6. **Toast Notifications:** `sonner` for all user feedback

### Code Style

```typescript
// Server action pattern
export async function getPlayerStats(playerId: string): Promise<PlayerStats> {
  // 1. Auth check (optional for reads)
  // 2. Query
  // 3. Transform
  // 4. Return typed result
}

// Hook pattern
export function usePlayerStats(playerId: string) {
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch on mount
  // Return { stats, isLoading, refresh }
}
```

---

## 10. Summary for PLAN Phase

### What's Already Done
- ✅ Goal scoring with scorer/assist tracking
- ✅ Player ratings with 38-value scale
- ✅ Match history display
- ✅ Completed match detail view
- ✅ Match lifecycle management
- ✅ Participation tracking

### What Needs Implementation
1. **Statistics Aggregation Layer** - `lib/db/statistics.ts`
2. **Match Photo Upload** - `lib/db/match-photos.ts` + UI
3. **Photo Compression** - Install browser-image-compression
4. **Goalkeeper Saves Field** - Schema migration
5. **Player Stats UI** - Dashboard widgets, profile pages
6. **Team Record Display** - W/L/D badge component

### Estimated Scope
- **Files to Create:** ~12-15
- **Files to Modify:** ~5-8
- **Schema Changes:** 1-2 fields (saves, photos)
- **New Dependencies:** 1 (browser-image-compression)

---

## Research Complete

**Next Step:** Create `05-PLAN.md` with detailed task breakdown.
