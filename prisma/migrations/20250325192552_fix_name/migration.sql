/*
  Warnings:

  - You are about to drop the column `sigDisconnectionReqirements` on the `Requests` table. All the data in the column will be lost.
  - You are about to drop the column `trdDisconnectionReqirements` on the `Requests` table. All the data in the column will be lost.
  - You are about to drop the column `sigDisconnectionReqirements` on the `Sanctiontable` table. All the data in the column will be lost.
  - You are about to drop the column `trdDisconnectionReqirements` on the `Sanctiontable` table. All the data in the column will be lost.
  - You are about to drop the column `sigDisconnectionReqirements` on the `StagingRequests` table. All the data in the column will be lost.
  - You are about to drop the column `trdDisconnectionReqirements` on the `StagingRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Requests" DROP COLUMN "sigDisconnectionReqirements",
DROP COLUMN "trdDisconnectionReqirements",
ADD COLUMN     "sigDisconnectionRequirements" TEXT,
ADD COLUMN     "trdDisconnectionRequirements" TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" DROP COLUMN "sigDisconnectionReqirements",
DROP COLUMN "trdDisconnectionReqirements",
ADD COLUMN     "sigDisconnectionRequirements" TEXT,
ADD COLUMN     "trdDisconnectionRequirements" TEXT;

-- AlterTable
ALTER TABLE "StagingRequests" DROP COLUMN "sigDisconnectionReqirements",
DROP COLUMN "trdDisconnectionReqirements",
ADD COLUMN     "sigDisconnectionRequirements" TEXT,
ADD COLUMN     "trdDisconnectionRequirements" TEXT;
