/*
  Warnings:

  - The `status` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RESERVATION_STATUS" AS ENUM ('ACTIVE', 'FORFEITED', 'DONE', 'DELETED');

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "status",
ADD COLUMN     "status" "RESERVATION_STATUS" NOT NULL DEFAULT 'ACTIVE';
