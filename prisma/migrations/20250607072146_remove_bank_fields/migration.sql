/*
  Warnings:

  - You are about to drop the column `bankAccount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bankAccount",
DROP COLUMN "bankName";
