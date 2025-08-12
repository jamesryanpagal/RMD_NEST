/*
  Warnings:

  - A unique constraint covering the columns `[clientRequestId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "clientRequestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientRequestId_key" ON "public"."Client"("clientRequestId");

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_clientRequestId_fkey" FOREIGN KEY ("clientRequestId") REFERENCES "public"."ClientRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
