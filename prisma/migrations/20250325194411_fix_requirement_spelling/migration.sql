/*
  Warnings:

  - You are about to drop the column `sigDisconnectionRequirements` on the `StagingRequests` table. All the data in the column will be lost.
  - You are about to drop the column `trdDisconnectionRequirements` on the `StagingRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StagingRequests" DROP COLUMN "sigDisconnectionRequirements",
DROP COLUMN "trdDisconnectionRequirements",
ADD COLUMN     "sigDisconnectionReqirements" TEXT,
ADD COLUMN     "trdDisconnectionReqirements" TEXT;
