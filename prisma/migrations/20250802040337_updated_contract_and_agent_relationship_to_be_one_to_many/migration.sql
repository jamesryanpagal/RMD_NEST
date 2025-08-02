/*
  Warnings:

  - You are about to drop the column `contractId` on the `Agent` table. All the data in the column will be lost.
  - Added the required column `agentId` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_contractId_fkey";

-- DropIndex
DROP INDEX "Agent_contractId_key";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "contractId";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "agentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
