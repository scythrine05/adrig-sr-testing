-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "sigDisconnectionReqirements" TEXT,
ADD COLUMN     "trdDisconnectionReqirements" TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "sigDisconnectionReqirements" TEXT,
ADD COLUMN     "trdDisconnectionReqirements" TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" ADD COLUMN     "sigDisconnectionReqirements" TEXT,
ADD COLUMN     "trdDisconnectionReqirements" TEXT;
