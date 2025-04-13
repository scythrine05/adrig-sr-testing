-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "sigResponse" SET DEFAULT 'yes',
ALTER COLUMN "oheResponse" SET DEFAULT 'yes';

-- AlterTable
ALTER TABLE "StagingRequests" ALTER COLUMN "sigResponse" SET DEFAULT 'yes',
ALTER COLUMN "oheResponse" SET DEFAULT 'yes';
