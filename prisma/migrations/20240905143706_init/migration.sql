-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "optimised" TEXT NOT NULL DEFAULT 'notset';
