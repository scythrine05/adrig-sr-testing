/*
  Warnings:

  - You are about to drop the `SanctionTable` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (concat('Request_', gen_random_uuid()))::TEXT;

-- DropTable
DROP TABLE "SanctionTable";

-- CreateTable
CREATE TABLE "Sanctiontable" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "selectedDepartment" TEXT NOT NULL,
    "selectedSection" TEXT NOT NULL,
    "stationID" TEXT NOT NULL,
    "missionBlock" TEXT NOT NULL,
    "workType" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "selectedLine" TEXT NOT NULL,
    "cautionRequired" TEXT NOT NULL,
    "cautionSpeed" TEXT NOT NULL,
    "cautionLocationFrom" TEXT NOT NULL,
    "cautionLocationTo" TEXT NOT NULL,
    "workLocationFrom" TEXT NOT NULL,
    "workLocationTo" TEXT NOT NULL,
    "demandTimeFrom" TEXT NOT NULL,
    "demandTimeTo" TEXT NOT NULL,
    "sigDisconnection" TEXT NOT NULL,
    "ohDisconnection" TEXT NOT NULL,
    "elementarySectionFrom" TEXT NOT NULL,
    "elementarySectionTo" TEXT NOT NULL,
    "otherLinesAffected" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'none',
    "remarks" TEXT,

    CONSTRAINT "Sanctiontable_pkey" PRIMARY KEY ("id")
);
