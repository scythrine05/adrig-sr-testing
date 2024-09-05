-- AlterTable
ALTER TABLE "Requests" ALTER COLUMN "requestId" SET DEFAULT (concat('Request_', gen_random_uuid()))::TEXT;

-- CreateTable
CREATE TABLE "SanctionTable" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'none',
    "remarks" TEXT,

    CONSTRAINT "SanctionTable_pkey" PRIMARY KEY ("id")
);
