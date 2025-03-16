-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "sigResponse" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "depot" TEXT DEFAULT '';
