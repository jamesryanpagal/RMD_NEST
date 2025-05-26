/*
  Warnings:

  - You are about to drop the column `clientId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `contractId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_clientId_fkey";

-- DropIndex
DROP INDEX "Payment_clientId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "clientId",
ADD COLUMN     "contractId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
