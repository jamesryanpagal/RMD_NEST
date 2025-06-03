/*
  Warnings:

  - You are about to drop the column `agent` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Contract` table. All the data in the column will be lost.
  - The `status` column on the `Contract` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Lot` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `commissionTotal` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `miscellaneousTotal` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tcp` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLotPrice` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservationId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionType` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CONTRACT_STATUS" AS ENUM ('ON_GOING', 'FORFEITED', 'DONE');

-- CreateEnum
CREATE TYPE "LOT_STATUS" AS ENUM ('OPEN', 'PENDING', 'CLOSED', 'SOLD');

-- CreateEnum
CREATE TYPE "TRANSACTION_TYPE" AS ENUM ('HOLDING_FEE', 'RESERVATION_FEE', 'PARTIAL_DOWN_PAYMENT', 'FULL_DOWN_PAYMENT', 'MONTHLY_PAYMENT', 'TCP_FULL_PAYMENT', 'DOWN_PAYMENT', 'SURVEY_FEE');

-- AlterEnum
ALTER TYPE "COMMISSION" ADD VALUE 'TWELVE';

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "agent",
DROP COLUMN "total",
ADD COLUMN     "commissionTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "miscellaneousTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tcp" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalLotPrice" DOUBLE PRECISION NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "CONTRACT_STATUS" NOT NULL DEFAULT 'ON_GOING';

-- AlterTable
ALTER TABLE "Lot" DROP COLUMN "status",
ADD COLUMN     "status" "LOT_STATUS" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "reservationId" TEXT NOT NULL,
ADD COLUMN     "transactionType" "TRANSACTION_TYPE" NOT NULL;

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "status" "STATUS" NOT NULL DEFAULT 'ACTIVE',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "birthDate" TEXT,
    "status" "STATUS" NOT NULL DEFAULT 'ACTIVE',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
