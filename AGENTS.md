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

Focus on correctness, data integrity, and preventing invalid states.
