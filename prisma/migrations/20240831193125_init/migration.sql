/*
  Warnings:

  - You are about to drop the column `optimised` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requestId]` on the table `Sanctiontable` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (concat('Request_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "optimised";

-- CreateIndex
CREATE UNIQUE INDEX "Sanctiontable_requestId_key" ON "Sanctiontable"("requestId");
