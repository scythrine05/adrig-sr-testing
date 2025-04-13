-- AlterTable
ALTER TABLE "Sanctiontable" ADD COLUMN     "availed" JSONB DEFAULT '{"status":"pending","reason":""}';
