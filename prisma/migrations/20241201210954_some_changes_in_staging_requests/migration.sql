-- DropForeignKey
ALTER TABLE "StagingRequests" DROP CONSTRAINT "StagingRequests_Manager_fkey";

-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" ADD COLUMN     "managerId" TEXT,
ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- RenameForeignKey
ALTER TABLE "StagingRequests" RENAME CONSTRAINT "StagingRequests_User_fkey" TO "StagingRequests_userId_fkey";

-- AddForeignKey
ALTER TABLE "StagingRequests" ADD CONSTRAINT "StagingRequests_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
