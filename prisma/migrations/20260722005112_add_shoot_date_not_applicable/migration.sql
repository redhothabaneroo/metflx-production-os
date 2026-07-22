-- AlterTable
ALTER TABLE "shoot_dates" ADD COLUMN     "notApplicable" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "date" DROP NOT NULL;
