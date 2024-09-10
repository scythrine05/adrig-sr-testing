/*
  Warnings:

  - Added the required column `sigElementarySectionFrom` to the `Sanctiontable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "sigElementarySectionFrom" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sigElementarySectionTo" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "sigElementarySectionFrom" TEXT NOT NULL,
ADD COLUMN     "sigElementarySectionTo" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "otherLinesAffected" SET DEFAULT '';
