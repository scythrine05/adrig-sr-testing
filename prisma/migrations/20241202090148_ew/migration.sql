-- DropForeignKey
ALTER TABLE "Requests" DROP CONSTRAINT "Requests_userId_fkey";

-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StagingRequests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
