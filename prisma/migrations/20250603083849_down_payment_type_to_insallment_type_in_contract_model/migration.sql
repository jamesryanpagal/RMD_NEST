/*
  Warnings:

  - You are about to drop the column `downPayment` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `downPaymentType` on the `Contract` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "INSTALLMENT_TYPE" AS ENUM ('FULL_DOWN_PAYMENT', 'PARTIAL_DOWN_PAYMENT');

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "downPayment",
DROP COLUMN "downPaymentType",
ADD COLUMN     "installmentType" "INSTALLMENT_TYPE";

-- DropEnum
DROP TYPE "CONTRACT_DOWN_PAYMENT_TYPE";
