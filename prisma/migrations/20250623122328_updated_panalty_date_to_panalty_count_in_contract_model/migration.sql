/*
  Warnings:

  - You are about to drop the column `penaltyDateApplied` on the `Contract` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "penaltyDateApplied",
ADD COLUMN     "penaltyCount" INTEGER NOT NULL DEFAULT 0;
