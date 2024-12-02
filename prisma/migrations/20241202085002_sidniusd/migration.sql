-- DropForeignKey
ALTER TABLE "StagingRequests" DROP CONSTRAINT "StagingRequests_userId_fkey";

-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StagingRequests" ADD CONSTRAINT "StagingRequests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
