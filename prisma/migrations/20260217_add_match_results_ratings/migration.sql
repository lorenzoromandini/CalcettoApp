-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "matches" ALTER COLUMN "status" SET DATA TYPE "MatchStatus" USING ("status"::"MatchStatus");
ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "match_players" ADD COLUMN "played" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "scorer_id" TEXT NOT NULL,
    "assister_id" TEXT,
    "is_own_goal" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_ratings" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goals_match_id_idx" ON "goals"("match_id");

-- CreateIndex
CREATE INDEX "goals_scorer_id_idx" ON "goals"("scorer_id");

-- CreateIndex
CREATE UNIQUE INDEX "goals_match_id_order_key" ON "goals"("match_id", "order");

-- CreateIndex
CREATE INDEX "player_ratings_match_id_idx" ON "player_ratings"("match_id");

-- CreateIndex
CREATE INDEX "player_ratings_player_id_idx" ON "player_ratings"("player_id");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "player_ratings_match_id_player_id_key" ON "player_ratings"("match_id", "player_id");

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_scorer_id_fkey" FOREIGN KEY ("scorer_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_assister_id_fkey" FOREIGN KEY ("assister_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_ratings" ADD CONSTRAINT "player_ratings_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_ratings" ADD CONSTRAINT "player_ratings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey (MatchTimer removal)
-- Note: MatchTimer was removed from schema, but since it was never used, we don't need to drop anything
