-- AlterTable
ALTER TABLE "Manager" DROP CONSTRAINT IF EXISTS "Manager_phone_key";
ALTER TABLE "Manager" DROP COLUMN IF EXISTS "phone";

-- AlterTable: Change Otp.phone to Otp.email
ALTER TABLE "Otp" DROP CONSTRAINT IF EXISTS "Otp_phone_key";
ALTER TABLE "Otp" DROP COLUMN IF EXISTS "phone";
ALTER TABLE "Otp" ALTER COLUMN "email" SET NOT NULL;
