/*
  Warnings:

  - You are about to drop the `AdminAudit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecretaryAudit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AdminAudit" DROP CONSTRAINT "AdminAudit_targetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SecretaryAudit" DROP CONSTRAINT "SecretaryAudit_targetId_fkey";

-- DropTable
DROP TABLE "public"."AdminAudit";

-- DropTable
DROP TABLE "public"."SecretaryAudit";
