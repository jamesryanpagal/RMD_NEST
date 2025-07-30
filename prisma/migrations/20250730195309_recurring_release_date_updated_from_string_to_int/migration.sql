/*
  Warnings:

  - The `recurringReleaseDate` column on the `AgentCommission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AgentCommission" DROP COLUMN "recurringReleaseDate",
ADD COLUMN     "recurringReleaseDate" INTEGER;
