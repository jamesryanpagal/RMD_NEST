/*
  Warnings:

  - Made the column `role` on table `UserAudit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."UserAudit" ALTER COLUMN "role" SET NOT NULL;
