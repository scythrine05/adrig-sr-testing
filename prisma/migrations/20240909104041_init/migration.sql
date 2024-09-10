-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_id_seq')::TEXT, 6, '0'))::TEXT,
ALTER COLUMN "sigElementarySectionFrom" DROP DEFAULT,
ALTER COLUMN "sigElementarySectionTo" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Sanctiontable" ALTER COLUMN "otherLinesAffected" DROP DEFAULT,
ALTER COLUMN "sigElementarySectionTo" DROP DEFAULT;
