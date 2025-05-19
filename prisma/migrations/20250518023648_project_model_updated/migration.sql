/*
  Warnings:

  - You are about to drop the column `platform` on the `AuthSession` table. All the data in the column will be lost.
  - You are about to drop the column `agent` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `block` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `commission` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `downPayment` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `lot` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `miscellaneous` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `sqm` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `sqmPrice` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `terms` on the `Client` table. All the data in the column will be lost.
  - Added the required column `lotId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barangay` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PAYMENT_TYPE" AS ENUM ('CASH', 'INSTALLMENT');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_projectId_fkey";

-- AlterTable
ALTER TABLE "AuthSession" DROP COLUMN "platform";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "agent",
DROP COLUMN "block",
DROP COLUMN "commission",
DROP COLUMN "downPayment",
DROP COLUMN "lot",
DROP COLUMN "miscellaneous",
DROP COLUMN "sqm",
DROP COLUMN "sqmPrice",
DROP COLUMN "terms",
ADD COLUMN     "lotId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "barangay" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "houseNumber" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "subdivision" TEXT,
ADD COLUMN     "zip" TEXT;

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "sqmPrice" DOUBLE PRECISION NOT NULL,
    "downPayment" DOUBLE PRECISION NOT NULL,
    "terms" INTEGER NOT NULL,
    "miscellaneous" "MISCELLANEOUS" NOT NULL,
    "agent" TEXT NOT NULL,
    "commission" "COMMISSION" NOT NULL,
    "paymentType" "PAYMENT_TYPE" NOT NULL,
    "status" "STATUS" NOT NULL DEFAULT 'ACTIVE',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
