-- AlterTable: Add username field to User table
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- CreateIndex: Make username unique
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AlterTable: Make phone nullable
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;
