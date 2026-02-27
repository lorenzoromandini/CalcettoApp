# CalcettoApp – Agent Operating Guide

Next.js (App Router) + TypeScript application for managing casual calcetto (5v5 football) matches among friends/club members.  
Uses Prisma ORM + PostgreSQL.

---

## Quick Commands

```bash
# Dependencies & development
npm install
npm run dev

# Build & production
npm run build
npm start

# Prisma helpers
npx prisma generate          # after any schema change (rare)
# npx prisma migrate dev     # ONLY when owner explicitly instructs
```

Never run migrations when fixing logic, validation or UI issues.

---

## Core Rules

- All database access must go through Prisma Client (no raw SQL unless owner explicitly approves).
- Keep business logic server-side (Server Actions, route handlers, services in `/lib`).
- Use transactions (`prisma.$transaction`) for operations that must be atomic:
  - Finalizing match score + status + creating goals
  - Creating formation + positions
  - Completing player ratings
- Validate all writes in application code (do not rely solely on database constraints).

---

## Important Invariants to Respect

These are enforced at both database and application level:

- Exactly one formation per side per match (`Formation` unique on `matchId + isHome`).
- One rating per player per match (`PlayerRating` unique on `matchId + clubMemberId`).
- Goal order must be unique per match.
- Jersey number unique per club (`ClubMember` unique on `clubId + jerseyNumber`).
- Club membership unique (`ClubMember` unique on `clubId + userId`).
- Player ratings use `Decimal(3,2)` precision.

---

## Prisma & Schema Guidance

- The authoritative Prisma schema lives in `/prisma/schema.prisma`.
- Read that file directly whenever you need to understand models, fields, relations, constraints, enums, defaults, indexes, unique rules, cascades, etc.
- Never propose or generate changes to the schema, including:
  - adding or removing models/fields
  - modifying relations, enums, indexes, `@@unique`, `@@index`, `@@map`
  - changing defaults, types, or `onDelete` behavior

If a requested feature clearly requires schema changes:

> clearly state “This requires modifying the Prisma schema” and stop.

Do not suggest concrete schema edits unless the owner explicitly asks.

---

## Code Style & Patterns

- Use camelCase for variables, function parameters, local constants, and object properties.  
  Good: `matchData`, `homeScore`, `isFinalized`, `playerPositions`, `createFormation`, `awayTeamPlayers`  
  Avoid: `match_data`, `HomeScore`, `IS_FINALIZED`, `player_positions`
- Prefer Server Actions for mutations and form handling.
- Use JSDoc or Google-style docstrings for non-trivial functions/services.
- PascalCase for types, components, and enum values.

### Transaction Example

```ts
await prisma.$transaction(async (tx) => {
  await tx.match.update({
    where: { id: matchId },
    data: { status: 'COMPLETED', homeScore, awayScore }
  })

  await tx.goal.createMany({
    data: goalsData
  })
})
```

---

## Workflow Reminders

- For multi-step tasks:
  identify affected entities → determine transaction boundaries → verify constraints/uniqueness → implement the smallest correct change.
- Prefer minimal, focused edits over large refactors.
- When in doubt about relations, constraints or defaults: read `/prisma/schema.prisma` first.

---

## Club Privileges System

### Privilege Hierarchy

Three privilege levels exist, managed via the `ClubPrivilege` enum in Prisma:

- **OWNER** (Proprietario)
- **MANAGER** 
- **MEMBER**

### Permission Matrix

| Operation | OWNER | MANAGER | MEMBER |
|-----------|-------|---------|--------|
| **Club Management** ||||
| Modify club name/description/image | ✅ | ❌ | ❌ |
| Delete club | ✅ | ❌ | ❌ |
| View club details | ✅ | ✅ | ✅ |
| **Roster Management** ||||
| Invite new members | ✅ | ✅ | ❌ |
| Kick/Eject members | ✅ | ❌ | ❌ |
| Promote to MANAGER | ✅ | ❌ | ❌ |
| Demote from MANAGER | ✅ | ❌ | ❌ |
| View roster | ✅ | ✅ | ✅ |
| **Match Operations** ||||
| Create matches | ✅ | ✅ | ❌ |
| Edit match details | ✅ | ✅ | ❌ |
| Match formations management | ✅ | ✅ | ❌ |
| Delete matches | ✅ | ✅ | ❌ |
| Join match as player | ✅ | ✅ | ✅ |
| **Match Lifecycle** ||||
| Start match | ✅ | ✅ | ❌ |
| End match | ✅ | ✅ | ❌ |
| Finalize results/scores | ✅ | ✅ | ❌ |
| Add/remove goals | ✅ | ✅ | ❌ |
| Assign player ratings | ✅ | ✅ | ❌ |
| **Other** ||||
| Generate invite links | ✅ | ✅ | ❌ |
| View statistics | ✅ | ✅ | ✅ |
| View match history | ✅ | ✅ | ✅ |

### Key Implementation Details

1. **Club Creator**: Automatically becomes OWNER upon creation via `setup-player` flow.

2. **Database Constraints**:
   - Unique constraint on `(clubId, userId)` in `ClubMember` table
   - Unique constraint on `(clubId, jerseyNumber)` to prevent duplicates

3. **Helper Functions**:
   - `isClubAdmin(clubId, userId)`: Returns true if OWNER or MANAGER
   - `isClubOwner(clubId, userId)`: Returns true only if OWNER

4. **API Protection**:
   - Club modifications (update/delete): Requires OWNER
   - Match creation/management: Requires ADMIN (OWNER or MANAGER)
   - Member ejection/role changes: Requires OWNER

### Code Examples

```typescript
// Check for OWNER-only operations
const isOwner = await isClubOwner(clubId, userId)
if (!isOwner) throw new Error('Solo il proprietario può eseguire questa azione')

// Check for ADMIN operations (OWNER or MANAGER)
const isAdmin = await isClubAdmin(clubId, userId)
if (!isAdmin) throw new Error('Permessi insufficienti')
```

---

## Internationalization (i18n)

### Language Configuration

**IMPORTANT**: The application is configured to support **ONLY Italian language**.

**Configuration Details:**
- **Default Locale**: `it` (Italian)
- **Supported Locales**: Only `['it']` - English and other languages are NOT supported
- **URL Prefix**: `localePrefix: 'never'` - No language prefix in URLs
  - URLs should be: `/dashboard`, `/clubs`, `/clubs/roster`
  - NOT: `/it/dashboard`, `/en/clubs`

**Implementation:**
- All UI text must be in Italian
- No language switcher component should be added
- The `locale` parameter is passed through components but should always be `'it'`
- When building URLs manually, do NOT include the locale:
  - ❌ `/${locale}/clubs/${clubId}`
  - ✅ `/clubs/${clubId}`

**Files to Check:**
- `lib/i18n/routing.ts` - Routing configuration
- `lib/i18n/navigation.ts` - Navigation exports (uses Next.js Link, not next-intl Link)
- `proxy.ts` - Middleware configuration
- All page components using router.push or Link

**Never:**
- Add a language switcher
- Support multiple languages
- Show language prefix in URLs
- Allow users to change language

**Always:**
- Keep all text in Italian
- Use Italian translations from `messages/it.json`
- Build URLs without locale prefix

---

Focus on correctness, data integrity, and preventing invalid states.
