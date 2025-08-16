/*
  Warnings:

  - You are about to drop the column `transactionType` on the `ReservationRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ReservationRequest" DROP COLUMN "transactionType";
