/*
  Warnings:

  - Added the required column `cautionLocationFrom` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cautionLocationTo` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cautionRequired` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cautionSpeed` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `demandTimeFrom` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `demandTimeTo` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elementarySectionFrom` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elementarySectionTo` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `missionBlock` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ohDisconnection` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherLinesAffected` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestId` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedDepartment` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedLine` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedSection` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sigDisconnection` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stationID` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workDescription` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workLocationFrom` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workLocationTo` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workType` to the `SanctionTable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (concat('Request_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "SanctionTable" ADD COLUMN     "cautionLocationFrom" TEXT NOT NULL,
ADD COLUMN     "cautionLocationTo" TEXT NOT NULL,
ADD COLUMN     "cautionRequired" TEXT NOT NULL,
ADD COLUMN     "cautionSpeed" TEXT NOT NULL,
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "demandTimeFrom" TEXT NOT NULL,
ADD COLUMN     "demandTimeTo" TEXT NOT NULL,
ADD COLUMN     "elementarySectionFrom" TEXT NOT NULL,
ADD COLUMN     "elementarySectionTo" TEXT NOT NULL,
ADD COLUMN     "missionBlock" TEXT NOT NULL,
ADD COLUMN     "ohDisconnection" TEXT NOT NULL,
ADD COLUMN     "otherLinesAffected" TEXT NOT NULL,
ADD COLUMN     "requestId" TEXT NOT NULL,
ADD COLUMN     "selectedDepartment" TEXT NOT NULL,
ADD COLUMN     "selectedLine" TEXT NOT NULL,
ADD COLUMN     "selectedSection" TEXT NOT NULL,
ADD COLUMN     "sigDisconnection" TEXT NOT NULL,
ADD COLUMN     "stationID" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "workDescription" TEXT NOT NULL,
ADD COLUMN     "workLocationFrom" TEXT NOT NULL,
ADD COLUMN     "workLocationTo" TEXT NOT NULL,
ADD COLUMN     "workType" TEXT NOT NULL;
