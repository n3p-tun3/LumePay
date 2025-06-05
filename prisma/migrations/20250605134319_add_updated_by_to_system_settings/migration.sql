/*
  Warnings:

  - You are about to drop the column `createdAt` on the `SystemSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SystemSettings" DROP COLUMN "createdAt",
ADD COLUMN     "updatedBy" TEXT;
