-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "sigResponse" SET DEFAULT 'yes';

-- AlterTable
ALTER TABLE "Sanctiontable" ALTER COLUMN "sigResponse" SET DEFAULT 'yes';

-- AlterTable
ALTER TABLE "StagingRequests" ALTER COLUMN "sigResponse" SET DEFAULT 'yes';
