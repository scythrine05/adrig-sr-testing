/*
  Warnings:

  - You are about to drop the column `ohDisconnection` on the `Requests` table. All the data in the column will be lost.
  - You are about to drop the column `ohDisconnection` on the `Sanctiontable` table. All the data in the column will be lost.
  - You are about to drop the column `ohDisconnection` on the `StagingRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Requests" DROP COLUMN "ohDisconnection",
ADD COLUMN     "oheDisconnection" TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" DROP COLUMN "ohDisconnection",
ADD COLUMN     "oheDisconnection" TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" DROP COLUMN "ohDisconnection",
ADD COLUMN     "oheDisconnection" TEXT;
