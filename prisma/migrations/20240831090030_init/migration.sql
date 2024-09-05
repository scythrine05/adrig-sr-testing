-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (concat('Request_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "optimised" TEXT NOT NULL DEFAULT 'stage1';
