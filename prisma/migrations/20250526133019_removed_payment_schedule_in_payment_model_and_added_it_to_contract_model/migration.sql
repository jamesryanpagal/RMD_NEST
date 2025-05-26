/*
  Warnings:

  - You are about to drop the column `paymentSchedule` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "paymentSchedule" "PAYMENT_SCHEDULE";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentSchedule";
