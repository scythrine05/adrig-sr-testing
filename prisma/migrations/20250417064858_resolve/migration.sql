/*
  Warnings:

  - You are about to drop the column `phone` on the `Manager` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Otp` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Manager_phone_key";

-- DropIndex
DROP INDEX "Otp_phone_key";

-- AlterTable
ALTER TABLE "Manager" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "phone";
