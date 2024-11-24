-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- CreateTable
CREATE TABLE "StagingRequests" (
    "requestId" TEXT NOT NULL DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT,
    "date" TEXT NOT NULL,
    "selectedDepartment" TEXT NOT NULL,
    "selectedSection" TEXT NOT NULL,
    "stationID" TEXT NOT NULL,
    "missionBlock" TEXT NOT NULL,
    "workType" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "selectedLine" JSONB NOT NULL,
    "selectedStream" TEXT,
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
    "sigElementarySectionFrom" TEXT NOT NULL,
    "sigElementarySectionTo" TEXT NOT NULL,
    "repercussions" TEXT NOT NULL,
    "otherLinesAffected" JSONB NOT NULL,
    "requestremarks" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "StagingRequests_pkey" PRIMARY KEY ("requestId")
);

-- AddForeignKey
ALTER TABLE "StagingRequests" ADD CONSTRAINT "StagingRequests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
