-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTill" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requests" (
    "requestId" TEXT NOT NULL DEFAULT (concat('Request_', gen_random_uuid()))::TEXT,
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

    CONSTRAINT "Requests_pkey" PRIMARY KEY ("requestId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_email_key" ON "Otp"("email");

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
