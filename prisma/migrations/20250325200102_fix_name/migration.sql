/*
  Warnings:

  - You are about to drop the column `sigDisconnectionReqirements` on the `StagingRequests` table. All the data in the column will be lost.
  - You are about to drop the column `trdDisconnectionReqirements` on the `StagingRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StagingRequests" DROP COLUMN "sigDisconnectionReqirements",
DROP COLUMN "trdDisconnectionReqirements",
ADD COLUMN     "sigDisconnectionRequirements" TEXT,
ADD COLUMN     "trdDisconnectionRequirements" TEXT;
