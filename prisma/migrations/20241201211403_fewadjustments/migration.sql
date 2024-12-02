-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "managerId" TEXT,
ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
