/*
  Warnings:

  - You are about to drop the column `SanctionedStatus` on the `StagingRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StagingRequests" DROP COLUMN "SanctionedStatus";
