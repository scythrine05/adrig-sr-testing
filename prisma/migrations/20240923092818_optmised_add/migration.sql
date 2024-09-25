-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "Optimisedtimefrom" TEXT,
ADD COLUMN     "Optimisedtimeto" TEXT,
ADD COLUMN     "optimization_details" TEXT;
