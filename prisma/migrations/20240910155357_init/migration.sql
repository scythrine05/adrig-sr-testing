/*
  Warnings:

  - Added the required column `repercussions` to the `Requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestremarks` to the `Requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repercussions` to the `Sanctiontable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestremarks` to the `Sanctiontable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "repercussions" TEXT NOT NULL,
ADD COLUMN     "requestremarks" TEXT NOT NULL,
ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT;

-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "repercussions" TEXT NOT NULL,
ADD COLUMN     "requestremarks" TEXT NOT NULL;
