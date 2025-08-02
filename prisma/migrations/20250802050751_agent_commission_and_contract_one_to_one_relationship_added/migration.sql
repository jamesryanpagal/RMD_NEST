/*
  Warnings:

  - A unique constraint covering the columns `[contractId]` on the table `AgentCommission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contractId` to the `AgentCommission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgentCommission" ADD COLUMN     "contractId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AgentCommission_contractId_key" ON "AgentCommission"("contractId");

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
