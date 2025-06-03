/*
  Warnings:

  - You are about to drop the column `installmentType` on the `Contract` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DOWN_PAYMENT_TYPE" AS ENUM ('FULL_DOWN_PAYMENT', 'PARTIAL_DOWN_PAYMENT');

-- CreateEnum
CREATE TYPE "DOWN_PAYMENT_STATUS" AS ENUM ('ON_GOING', 'FORFEITED', 'DONE');

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "installmentType",
ADD COLUMN     "downPaymentStatus" "DOWN_PAYMENT_STATUS",
ADD COLUMN     "downPaymentType" "DOWN_PAYMENT_TYPE";

-- DropEnum
DROP TYPE "INSTALLMENT_TYPE";
