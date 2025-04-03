-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "SanctionedStatus" TEXT NOT NULL DEFAULT 'UP',
ALTER COLUMN "requestId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StagingRequests" ADD COLUMN     "SanctionedStatus" TEXT NOT NULL DEFAULT 'UP',
ALTER COLUMN "requestId" DROP DEFAULT;
