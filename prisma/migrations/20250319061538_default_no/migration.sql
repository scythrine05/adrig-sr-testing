-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "sigResponse" SET DEFAULT 'no',
ALTER COLUMN "oheResponse" SET DEFAULT 'no';

-- AlterTable
ALTER TABLE "Sanctiontable" ALTER COLUMN "sigResponse" DROP DEFAULT,
ALTER COLUMN "oheResponse" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StagingRequests" ALTER COLUMN "sigResponse" SET DEFAULT 'no',
ALTER COLUMN "oheResponse" SET DEFAULT 'no';
