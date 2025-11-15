/*
  Warnings:

  - You are about to drop the column `accessLevel` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `accessLevel` on the `Secretary` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MODULE_ACCESS" AS ENUM ('PROJECT', 'PHASE', 'BLOCK', 'LOT', 'RESERVATION', 'CLIENTS', 'AGENT', 'CONTRACTS', 'AUDIT_TRAIL', 'REQUESTS');

-- AlterTable
ALTER TABLE "public"."Admin" DROP COLUMN "accessLevel",
ADD COLUMN     "moduleAccess" "public"."MODULE_ACCESS"[];

-- AlterTable
ALTER TABLE "public"."Secretary" DROP COLUMN "accessLevel",
ADD COLUMN     "moduleAccess" "public"."MODULE_ACCESS"[];
