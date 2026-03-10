-- AlterTable
ALTER TABLE "formation_positions" ADD COLUMN     "is_guest" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "club_member_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "is_guest_scorer" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "scorer_id" DROP NOT NULL;
