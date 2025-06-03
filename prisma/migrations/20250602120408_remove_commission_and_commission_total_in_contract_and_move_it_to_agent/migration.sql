/*
  Warnings:

  - You are about to drop the column `commission` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `commissionTotal` on the `Contract` table. All the data in the column will be lost.
  - Added the required column `commission` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commissionTotal` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terms` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "commission" "COMMISSION" NOT NULL,
ADD COLUMN     "commissionTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "terms" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "commission",
DROP COLUMN "commissionTotal";
