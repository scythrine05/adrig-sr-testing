-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "corridorType" TEXT,
ALTER COLUMN "sigResponse" SET DEFAULT 'yes',
ALTER COLUMN "oheResponse" SET DEFAULT 'yes';

-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "corridorType" TEXT,
ALTER COLUMN "sigResponse" SET DEFAULT 'yes',
ALTER COLUMN "oheResponse" SET DEFAULT 'yes';

-- AlterTable
ALTER TABLE "StagingRequests" ADD COLUMN     "corridorType" TEXT,
ALTER COLUMN "sigResponse" SET DEFAULT 'yes',
ALTER COLUMN "oheResponse" SET DEFAULT 'yes';
