/*
  Warnings:

  - You are about to drop the column `clientRequestId` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientId]` on the table `ClientRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Client" DROP CONSTRAINT "Client_clientRequestId_fkey";

-- DropIndex
DROP INDEX "public"."Client_clientRequestId_key";

-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "clientRequestId";

-- AlterTable
ALTER TABLE "public"."ClientRequest" ADD COLUMN     "clientId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ClientRequest_clientId_key" ON "public"."ClientRequest"("clientId");

-- AddForeignKey
ALTER TABLE "public"."ClientRequest" ADD CONSTRAINT "ClientRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
