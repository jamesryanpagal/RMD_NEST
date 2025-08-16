/*
  Warnings:

  - You are about to drop the column `clientId` on the `ReservationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `lotId` on the `ReservationRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ReservationRequest" DROP COLUMN "clientId",
DROP COLUMN "lotId";
