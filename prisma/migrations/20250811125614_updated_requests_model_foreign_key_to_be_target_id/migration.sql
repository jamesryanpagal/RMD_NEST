/*
  Warnings:

  - You are about to drop the column `clientId` on the `ClientRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[targetId]` on the table `ClientRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."ClientRequest" DROP CONSTRAINT "ClientRequest_clientId_fkey";

-- DropIndex
DROP INDEX "public"."ClientRequest_clientId_key";

-- AlterTable
ALTER TABLE "public"."ClientRequest" DROP COLUMN "clientId",
ADD COLUMN     "targetId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ClientRequest_targetId_key" ON "public"."ClientRequest"("targetId");

-- AddForeignKey
ALTER TABLE "public"."ClientRequest" ADD CONSTRAINT "ClientRequest_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
