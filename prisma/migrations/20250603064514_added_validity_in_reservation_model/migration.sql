/*
  Warnings:

  - Added the required column `validity` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "validity" TIMESTAMP(3) NOT NULL;
