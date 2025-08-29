/*
  Warnings:

  - The values [REQUEST] on the enum `MODULES` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MODULES_new" AS ENUM ('PROJECT', 'PHASE', 'BLOCK', 'LOT', 'CLIENT', 'USER', 'CONTRACT', 'PAYMENT', 'RESERVATION', 'AGENT', 'AGENT_COMMISSION', 'FILES', 'CLIENT_REQUEST', 'RESERVATION_REQUEST', 'CONTRACT_REQUEST', 'PAYMENT_REQUEST', 'AGENT_COMMISSION_REQUEST', 'FILES_REQUEST');
ALTER TYPE "public"."MODULES" RENAME TO "MODULES_old";
ALTER TYPE "public"."MODULES_new" RENAME TO "MODULES";
DROP TYPE "public"."MODULES_old";
COMMIT;
