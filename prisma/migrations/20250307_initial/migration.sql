-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchMode" AS ENUM ('FIVE_V_FIVE', 'EIGHT_V_EIGHT', 'ELEVEN_V_ELEVEN');

-- CreateEnum
CREATE TYPE "ClubPrivilege" AS ENUM ('MEMBER', 'MANAGER', 'OWNER');

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('POR', 'DIF', 'CEN', 'ATT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "nickname" TEXT,
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_members" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "privileges" "ClubPrivilege" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "primaryRole" "PlayerRole" NOT NULL,
    "secondaryRoles" "PlayerRole"[] DEFAULT ARRAY[]::"PlayerRole"[],
    "jerseyNumber" INTEGER NOT NULL,
    "symbol" TEXT,

    CONSTRAINT "club_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_invites" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "mode" "MatchMode" NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "home_score" INTEGER DEFAULT 0,
    "away_score" INTEGER DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "score_finalized_by" TEXT,
    "ratings_completed_by" TEXT,
    "score_finalized_at" TIMESTAMP(3),
    "ratings_completed_at" TIMESTAMP(3),
    "shared_token" TEXT,
    "shared_at" TIMESTAMP(3),

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "is_home" BOOLEAN NOT NULL,
    "formation_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formation_positions" (
    "id" TEXT NOT NULL,
    "formation_id" TEXT NOT NULL,
    "club_member_id" TEXT NOT NULL,
    "position_x" INTEGER NOT NULL,
    "position_y" INTEGER NOT NULL,
    "position_label" TEXT NOT NULL,
    "is_substitute" BOOLEAN NOT NULL DEFAULT false,
    "played" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "formation_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "scorer_id" TEXT NOT NULL,
    "assister_id" TEXT,
    "is_own_goal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_ratings" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "club_member_id" TEXT NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_statistics" (
    "id" TEXT NOT NULL,
    "club_member_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "appearances" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "current_win_streak" INTEGER NOT NULL DEFAULT 0,
    "max_win_streak" INTEGER NOT NULL DEFAULT 0,
    "current_loss_streak" INTEGER NOT NULL DEFAULT 0,
    "max_loss_streak" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "goals_conceded" INTEGER,
    "matches_as_gk" INTEGER,
    "last_match_date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "clubs_created_by_idx" ON "clubs"("created_by");

-- CreateIndex
CREATE INDEX "clubs_deleted_at_idx" ON "clubs"("deleted_at");

-- CreateIndex
CREATE INDEX "club_members_club_id_idx" ON "club_members"("club_id");

-- CreateIndex
CREATE INDEX "club_members_user_id_idx" ON "club_members"("user_id");

-- CreateIndex
CREATE INDEX "club_members_deleted_at_idx" ON "club_members"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "club_members_club_id_user_id_key" ON "club_members"("club_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "club_members_club_id_jerseyNumber_key" ON "club_members"("club_id", "jerseyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "club_invites_token_key" ON "club_invites"("token");

-- CreateIndex
CREATE INDEX "club_invites_club_id_idx" ON "club_invites"("club_id");

-- CreateIndex
CREATE INDEX "club_invites_token_idx" ON "club_invites"("token");

-- CreateIndex
CREATE INDEX "club_invites_expires_at_idx" ON "club_invites"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "matches_shared_token_key" ON "matches"("shared_token");

-- CreateIndex
CREATE INDEX "matches_club_id_idx" ON "matches"("club_id");

-- CreateIndex
CREATE INDEX "matches_scheduled_at_idx" ON "matches"("scheduled_at");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "matches_created_by_idx" ON "matches"("created_by");

-- CreateIndex
CREATE INDEX "matches_score_finalized_by_idx" ON "matches"("score_finalized_by");

-- CreateIndex
CREATE INDEX "matches_ratings_completed_by_idx" ON "matches"("ratings_completed_by");

-- CreateIndex
CREATE INDEX "matches_shared_token_idx" ON "matches"("shared_token");

-- CreateIndex
CREATE INDEX "formations_match_id_idx" ON "formations"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "formations_match_id_is_home_key" ON "formations"("match_id", "is_home");

-- CreateIndex
CREATE INDEX "formation_positions_formation_id_idx" ON "formation_positions"("formation_id");

-- CreateIndex
CREATE INDEX "formation_positions_club_member_id_idx" ON "formation_positions"("club_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "formation_positions_formation_id_club_member_id_key" ON "formation_positions"("formation_id", "club_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "formation_positions_formation_id_position_x_position_y_key" ON "formation_positions"("formation_id", "position_x", "position_y");

-- CreateIndex
CREATE INDEX "goals_match_id_idx" ON "goals"("match_id");

-- CreateIndex
CREATE INDEX "goals_scorer_id_idx" ON "goals"("scorer_id");

-- CreateIndex
CREATE INDEX "player_ratings_match_id_idx" ON "player_ratings"("match_id");

-- CreateIndex
CREATE INDEX "player_ratings_club_member_id_idx" ON "player_ratings"("club_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_ratings_match_id_club_member_id_key" ON "player_ratings"("match_id", "club_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_statistics_club_member_id_key" ON "member_statistics"("club_member_id");

-- CreateIndex
CREATE INDEX "member_statistics_club_id_idx" ON "member_statistics"("club_id");

-- CreateIndex
CREATE INDEX "member_statistics_club_member_id_idx" ON "member_statistics"("club_member_id");

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_invites" ADD CONSTRAINT "club_invites_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_invites" ADD CONSTRAINT "club_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_ratings_completed_by_fkey" FOREIGN KEY ("ratings_completed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_score_finalized_by_fkey" FOREIGN KEY ("score_finalized_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_positions" ADD CONSTRAINT "formation_positions_club_member_id_fkey" FOREIGN KEY ("club_member_id") REFERENCES "club_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_positions" ADD CONSTRAINT "formation_positions_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_assister_id_fkey" FOREIGN KEY ("assister_id") REFERENCES "club_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_scorer_id_fkey" FOREIGN KEY ("scorer_id") REFERENCES "club_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_ratings" ADD CONSTRAINT "player_ratings_club_member_id_fkey" FOREIGN KEY ("club_member_id") REFERENCES "club_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_ratings" ADD CONSTRAINT "player_ratings_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_statistics" ADD CONSTRAINT "member_statistics_club_member_id_fkey" FOREIGN KEY ("club_member_id") REFERENCES "club_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

