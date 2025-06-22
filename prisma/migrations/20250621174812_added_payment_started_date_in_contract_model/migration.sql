/*
  Warnings:

  - Added the required column `paymentStartedDate` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "paymentStartedDate" TIMESTAMP(3) NOT NULL;
