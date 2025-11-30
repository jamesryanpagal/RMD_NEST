/*
  Warnings:

  - A unique constraint covering the columns `[contractId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Reservation" ADD COLUMN     "contractId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_contractId_key" ON "public"."Reservation"("contractId");

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
