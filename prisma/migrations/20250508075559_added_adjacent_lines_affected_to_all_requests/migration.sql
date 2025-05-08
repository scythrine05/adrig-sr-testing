-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "adjacentLinesAffected" TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "adjacentLinesAffected" TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" ADD COLUMN     "adjacentLinesAffected" TEXT;
