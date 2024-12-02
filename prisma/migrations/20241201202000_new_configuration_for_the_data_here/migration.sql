/*
  Warnings:

  - The primary key for the `Manager` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Requests" DROP CONSTRAINT "Requests_userId_fkey";

-- DropForeignKey
ALTER TABLE "StagingRequests" DROP CONSTRAINT "StagingRequests_Manager_fkey";

-- DropForeignKey
ALTER TABLE "StagingRequests" DROP CONSTRAINT "StagingRequests_User_fkey";

-- AlterTable
ALTER TABLE "Manager" DROP CONSTRAINT "Manager_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Manager_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Manager_id_seq";

-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "StagingRequests" ADD CONSTRAINT "StagingRequests_User_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StagingRequests" ADD CONSTRAINT "StagingRequests_Manager_fkey" FOREIGN KEY ("userId") REFERENCES "Manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
