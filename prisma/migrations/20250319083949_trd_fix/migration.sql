-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "trdActionsNeeded" TEXT DEFAULT 'yes';

-- AlterTable
ALTER TABLE "StagingRequests" ADD COLUMN     "trdActionsNeeded" TEXT DEFAULT 'yes';
