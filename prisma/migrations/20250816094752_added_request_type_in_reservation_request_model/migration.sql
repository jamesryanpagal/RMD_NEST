/*
  Warnings:

  - Added the required column `requestType` to the `ReservationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ReservationRequest" ADD COLUMN     "requestType" "public"."REQUEST_TYPE" NOT NULL;
