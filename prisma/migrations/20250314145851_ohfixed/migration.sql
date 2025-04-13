/*
  Warnings:

  - You are about to drop the column `oheDisconnection` on the `Requests` table. All the data in the column will be lost.
  - You are about to drop the column `oheDisconnection` on the `Sanctiontable` table. All the data in the column will be lost.
  - You are about to drop the column `oheDisconnection` on the `StagingRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Requests" DROP COLUMN "oheDisconnection",
ADD COLUMN     "ohDisconnection" TEXT,
ALTER COLUMN "sigResponse" SET DEFAULT 'yes';

-- AlterTable
ALTER TABLE "Sanctiontable" DROP COLUMN "oheDisconnection",
ADD COLUMN     "ohDisconnection" TEXT,
ALTER COLUMN "sigResponse" SET DEFAULT 'yes';

-- AlterTable
ALTER TABLE "StagingRequests" DROP COLUMN "oheDisconnection",
ADD COLUMN     "ohDisconnection" TEXT,
ALTER COLUMN "sigResponse" SET DEFAULT 'yes';
