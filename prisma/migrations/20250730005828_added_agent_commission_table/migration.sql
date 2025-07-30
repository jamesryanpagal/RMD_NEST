-- CreateEnum
CREATE TYPE "AGENT_COMMISSION_STATUS" AS ENUM ('PENDING', 'DELETED', 'ON_GOING', 'DONE');

-- AlterEnum
ALTER TYPE "TRANSACTION_TYPE" ADD VALUE 'AGENT_COMMISSION_RELEASE';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "agentCommissionId" TEXT;

-- CreateTable
CREATE TABLE "AgentCommission" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "terms" INTEGER NOT NULL,
    "releaseStartDate" TEXT,
    "releaseEndDate" TEXT,
    "nextReleaseDate" TEXT,
    "status" "AGENT_COMMISSION_STATUS" NOT NULL DEFAULT 'PENDING',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "AgentCommission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_agentCommissionId_fkey" FOREIGN KEY ("agentCommissionId") REFERENCES "AgentCommission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
