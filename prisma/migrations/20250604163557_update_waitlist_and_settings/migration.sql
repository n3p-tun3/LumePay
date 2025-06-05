/*
  Warnings:

  - You are about to drop the column `updatedBy` on the `SystemSettings` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `WaitlistEntry` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WaitlistEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WaitlistEntry" DROP CONSTRAINT "WaitlistEntry_userId_fkey";

-- DropIndex
DROP INDEX "WaitlistEntry_userId_key";

-- AlterTable
ALTER TABLE "SystemSettings" DROP COLUMN "updatedBy",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "WaitlistEntry" DROP COLUMN "approvedBy",
DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
