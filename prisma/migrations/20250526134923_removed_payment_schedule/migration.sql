/*
  Warnings:

  - You are about to drop the column `paymentSchedule` on the `Contract` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "paymentSchedule";

-- DropEnum
DROP TYPE "PAYMENT_SCHEDULE";
