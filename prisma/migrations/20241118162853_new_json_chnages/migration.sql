/*
  Warnings:

  - Changed the type of `selectedLine` on the `Requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `otherLinesAffected` on the `Requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `otherLinesAffected` on the `Sanctiontable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "selectedStream" TEXT,
ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT,
DROP COLUMN "selectedLine",
ADD COLUMN     "selectedLine" JSONB NOT NULL,
DROP COLUMN "otherLinesAffected",
ADD COLUMN     "otherLinesAffected" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "selectedStream" TEXT,
DROP COLUMN "otherLinesAffected",
ADD COLUMN     "otherLinesAffected" JSONB NOT NULL;
