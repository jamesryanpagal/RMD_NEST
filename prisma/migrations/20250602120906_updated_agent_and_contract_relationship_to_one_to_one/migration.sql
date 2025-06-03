/*
  Warnings:

  - A unique constraint covering the columns `[contractId]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Agent_contractId_key" ON "Agent"("contractId");
