/*
  Warnings:

  - You are about to drop the column `commission` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `commissionTotal` on the `Agent` table. All the data in the column will be lost.
  - Added the required column `agentCommission` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentCommissionTotal` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "commission",
DROP COLUMN "commissionTotal";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "agentCommission" "COMMISSION" NOT NULL,
ADD COLUMN     "agentCommissionTotal" DOUBLE PRECISION NOT NULL;
