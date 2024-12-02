/*
  Warnings:

  - The primary key for the `Manager` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Manager` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Manager" DROP CONSTRAINT "Manager_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Manager_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- RenameForeignKey
ALTER TABLE "StagingRequests" RENAME CONSTRAINT "StagingRequests_userId_fkey" TO "StagingRequests_User_fkey";

-- AddForeignKey
ALTER TABLE "StagingRequests" ADD CONSTRAINT "StagingRequests_Manager_fkey" FOREIGN KEY ("userId") REFERENCES "Manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
