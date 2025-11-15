/*
  Warnings:

  - The values [PROJECT,RESERVATION,AGENT,AUDIT_TRAIL] on the enum `MODULE_ACCESS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MODULE_ACCESS_new" AS ENUM ('PROJECTS', 'PHASE', 'BLOCK', 'LOT', 'RESERVATIONS', 'CLIENTS', 'AGENTS', 'CONTRACTS', 'AUDITTRAIL', 'REQUESTS');
ALTER TABLE "public"."Admin" ALTER COLUMN "moduleAccess" TYPE "public"."MODULE_ACCESS_new"[] USING ("moduleAccess"::text::"public"."MODULE_ACCESS_new"[]);
ALTER TABLE "public"."Secretary" ALTER COLUMN "moduleAccess" TYPE "public"."MODULE_ACCESS_new"[] USING ("moduleAccess"::text::"public"."MODULE_ACCESS_new"[]);
ALTER TYPE "public"."MODULE_ACCESS" RENAME TO "MODULE_ACCESS_old";
ALTER TYPE "public"."MODULE_ACCESS_new" RENAME TO "MODULE_ACCESS";
DROP TYPE "public"."MODULE_ACCESS_old";
COMMIT;
