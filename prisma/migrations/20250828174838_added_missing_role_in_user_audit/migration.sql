/*
  Warnings:

  - Added the required column `role` to the `UserAudit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."UserAudit" ADD COLUMN     "role" "public"."ROLE" NOT NULL;
