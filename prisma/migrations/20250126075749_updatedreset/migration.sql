-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "selectedDepo" TEXT,
ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "selectedDepo" TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" ADD COLUMN     "selectedDepo" TEXT,
ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;
