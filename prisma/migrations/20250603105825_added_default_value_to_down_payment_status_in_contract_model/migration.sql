/*
  Warnings:

  - Made the column `downPaymentStatus` on table `Contract` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "downPaymentStatus" SET NOT NULL,
ALTER COLUMN "downPaymentStatus" SET DEFAULT 'ON_GOING';
