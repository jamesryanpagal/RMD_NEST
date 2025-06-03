-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_contractId_fkey";

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
