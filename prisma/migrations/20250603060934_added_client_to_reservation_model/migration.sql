/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "clientId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_clientId_key" ON "Reservation"("clientId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
