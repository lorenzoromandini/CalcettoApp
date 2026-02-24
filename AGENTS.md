# CalcettoApp – Agent Operating Guide

Full-stack application for amateur football (calcetto) club management.  
Stack: Next.js (App Router), TypeScript, Prisma ORM, PostgreSQL.

This document defines strict operational constraints for AI agents working on this repository.

Agents must prioritize schema integrity, relational correctness, and transactional consistency.

---

## Project Structure

```
/app                 # Next.js App Router (pages, layouts, server actions)
/components          # Reusable UI components
/lib                 # Utilities, db client, auth helpers
/prisma
  └── schema.prisma  # DATABASE CONTRACT (LOCKED)
/public              # Static assets
/styles              # Global styles
```

Key principles:

- Business logic must remain server-side.
- All database access goes through Prisma Client.
- No direct SQL unless explicitly required and justified.
- No schema mutations unless explicitly authorized by the repository owner.

---

## Core Architectural Constraints

1. The Prisma schema is a **LOCKED CONTRACT**.

2. Agents MUST NOT:

- Add fields
- Remove fields
- Change enums
- Modify relations
- Change indexes
- Alter mappings (`@map`)

3. Agents may only:

- Write queries
- Refactor application logic
- Improve validation
- Add services/controllers/hooks

4. If a requested feature requires schema changes:

- Stop.
- Explicitly state that it requires schema modification.
- Do not propose silent schema edits.

---

## Build & Development Commands

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Production build
npm run build

# Start production
npm start

# Prisma generate
npx prisma generate

# Prisma migrate (ONLY if explicitly instructed by owner)
npx prisma migrate dev
```

Never run migrations automatically when solving logic bugs.

---

## Database Layer Rules

- All writes must be validated at application layer.
- Use transactions for:

  - Match finalization
  - Score + goals writes
  - Ratings completion
  - Formation creation with positions

- Maintain referential integrity.
- Never bypass Prisma Client.

Example transactional pattern:

```ts
await prisma.$transaction(async (tx) => {
  await tx.match.update({...})
  await tx.goal.createMany({...})
})
```

---

## Domain Model Overview

Entities:

- User
- Club
- ClubMember
- ClubInvite
- Match
- Formation
- FormationPosition
- Goal
- PlayerRating

Relationships are strongly relational and enforced by:

- Unique constraints
- Cascade deletes
- Compound uniqueness
- Indexed foreign keys

Agents must respect:

- Composite uniqueness constraints
- Business invariants (e.g., one formation per side per match)
- Decimal precision for ratings (`Decimal(3,2)`)

---

## Prisma Schema — LOCKED CONTRACT

The following schema is authoritative and must not be altered by agents.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum MatchStatus {
  SCHEDULED
  IN_PROGRESS
  FINISHED
  COMPLETED
  CANCELLED
}

enum MatchMode {
  FIVE_V_FIVE
  EIGHT_V_EIGHT
  ELEVEN_V_ELEVEN
}

enum ClubPrivilege {
  MEMBER
  MANAGER
  OWNER
}

enum PlayerRole {
  POR
  DIF
  CEN
  ATT
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  firstName String    @map("first_name")
  lastName  String    @map("last_name")
  nickname  String?   @map("nickname")
  image     String?
  password  String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  lastLogin DateTime?

  ownedClubs     Club[]         @relation("ClubOwner")
  memberships    ClubMember[]
  createdMatches Match[]        @relation("MatchCreator")

  @@index([email])
  @@map("users")
}

model Club {
  id          String    @id @default(cuid())
  name        String
  description String?
  imageUrl    String?   @map("image_url")

  createdBy   String    @map("created_by")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  creator     User      @relation("ClubOwner", fields: [createdBy], references: [id], onDelete: SetNull)

  members     ClubMember[]
  invites     ClubInvite[]
  matches     Match[]

  @@index([createdBy])
  @@index([deletedAt])
  @@map("clubs")
}

model ClubMember {
  id             String        @id @default(cuid())

  clubId         String        @map("club_id")
  userId         String        @map("user_id")

  privileges     ClubPrivilege @default(MEMBER)
  joinedAt       DateTime      @default(now()) @map("joined_at")

  primaryRole    PlayerRole
  secondaryRoles PlayerRole[]  @default([])
  jerseyNumber   Int

  club           Club          @relation(fields: [clubId], references: [id], onDelete: Cascade)
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  positionsInMatches FormationPosition[]
  scoredGoals        Goal[]              @relation("GoalScorer")
  assistedGoals      Goal[]              @relation("GoalAssister")
  receivedRatings    PlayerRating[]

  @@unique([clubId, userId])
  @@unique([clubId, jerseyNumber])
  @@index([clubId])
  @@index([userId])
  @@map("club_members")
}

model ClubInvite {
  id        String    @id @default(cuid())
  clubId    String    @map("club_id")
  createdBy String    @map("created_by")
  token     String    @unique
  expiresAt DateTime? @map("expires_at")

  createdAt DateTime  @default(now()) @map("created_at")

  club      Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  creator   User      @relation("InviteCreator", fields: [createdBy], references: [id], onDelete: SetNull)

  @@index([clubId])
  @@index([token])
  @@index([expiresAt])
  @@map("club_invites")
}

model Match {
  id                 String      @id @default(cuid())
  clubId             String      @map("club_id")
  scheduledAt        DateTime    @map("scheduled_at")
  location           String?
  mode               MatchMode
  status             MatchStatus @default(SCHEDULED)

  homeScore          Int?        @default(0) @map("home_score")
  awayScore          Int?        @default(0) @map("away_score")

  notes              String?
  createdAt          DateTime    @default(now()) @map("created_at")
  updatedAt          DateTime    @updatedAt @map("updated_at")

  createdBy          String      @map("created_by")
  scoreFinalizedBy   String?     @map("score_finalized_by")
  ratingsCompletedBy String?     @map("ratings_completed_by")

  scoreFinalizedAt   DateTime?   @map("score_finalized_at")
  ratingsCompletedAt DateTime?   @map("ratings_completed_at")

  sharedToken        String?     @unique @map("shared_token")
  sharedAt           DateTime?   @map("shared_at")

  club               Club        @relation(fields: [clubId], references: [id], onDelete: Cascade)

  creator            User        @relation("MatchCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  scoreFinalizer     User?       @relation("MatchScoreFinalizer", fields: [scoreFinalizedBy], references: [id], onDelete: SetNull)
  ratingsFinalizer   User?       @relation("MatchRatingsFinalizer", fields: [ratingsCompletedBy], references: [id], onDelete: SetNull)

  homeFormation      Formation?  @relation("HomeFormation")
  awayFormation      Formation?  @relation("AwayFormation")

  goals              Goal[]
  ratings            PlayerRating[]

  @@index([clubId])
  @@index([scheduledAt])
  @@index([status])
  @@index([createdBy])
  @@index([scoreFinalizedBy])
  @@index([ratingsCompletedBy])
  @@index([sharedToken])
  @@map("matches")
}

model Formation {
  id             String   @id @default(cuid())
  matchId        String   @map("match_id")
  isHome         Boolean  @map("is_home")
  formationName  String?  @map("formation_name")

  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  match          Match               @relation(fields: [matchId], references: [id], onDelete: Cascade)
  positions      FormationPosition[]

  @@unique([matchId, isHome])
  @@index([matchId])
  @@map("formations")
}

model FormationPosition {
  id              String      @id @default(cuid())
  formationId     String      @map("formation_id")
  clubMemberId    String      @map("club_member_id")
  positionX       Int         @map("position_x")
  positionY       Int         @map("position_y")
  positionLabel   String      @map("position_label")
  isSubstitute    Boolean     @default(false) @map("is_substitute")
  played          Boolean     @default(false) @map("played")

  formation       Formation   @relation(fields: [formationId], references: [id], onDelete: Cascade)
  clubMember      ClubMember  @relation(fields: [clubMemberId], references: [id], onDelete: Cascade)

  @@unique([formationId, clubMemberId])
  @@unique([formationId, positionX, positionY])
  @@index([formationId])
  @@index([clubMemberId])
  @@map("formation_positions")
}

model Goal {
  id           String   @id @default(cuid())
  matchId      String   @map("match_id")
  scorerId     String   @map("scorer_id")
  assisterId   String?  @map("assister_id")
  isOwnGoal    Boolean  @default(false) @map("is_own_goal")
  order        Int

  createdAt    DateTime @default(now()) @map("created_at")

  match        Match       @relation(fields: [matchId], references: [id], onDelete: Cascade)
  scorer       ClubMember  @relation("GoalScorer", fields: [scorerId], references: [id], onDelete: Cascade)
  assister     ClubMember? @relation("GoalAssister", fields: [assisterId], references: [id], onDelete: SetNull)

  @@unique([matchId, order])
  @@index([matchId])
  @@index([scorerId])
  @@map("goals")
}

model PlayerRating {
  id           String    @id @default(cuid())
  matchId      String    @map("match_id")
  clubMemberId String    @map("club_member_id")
  rating       Decimal   @db.Decimal(3,2)
  comment      String?

  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  match        Match      @relation(fields: [matchId], references: [id], onDelete: Cascade)
  clubMember   ClubMember @relation(fields: [clubMemberId], references: [id], onDelete: Cascade)

  @@unique([matchId, clubMemberId])
  @@index([matchId])
  @@index([clubMemberId])
  @@map("player_ratings")
}
```

---

## Locked Business Invariants

Agents must enforce at application level:

- One formation per side per match.
- One rating per player per match.
- Goal order must be unique per match.
- Jersey number unique per club.
- Composite uniqueness (`clubId + userId`) must never be bypassed.
- Decimal rating precision must remain `(3,2)`.

---

## Agent Workflow Rules

For multi-step tasks:

1. Identify impacted domain entities.
2. Identify transactional boundaries.
3. Validate against schema constraints.
4. Implement minimal necessary change.
5. Do not refactor unrelated logic.

No speculative refactors.

If a requested solution violates:

- Schema contract
- Relational integrity
- Domain invariants

The agent must halt and explicitly declare the violation.
