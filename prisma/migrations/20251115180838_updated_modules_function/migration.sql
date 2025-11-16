/*
  Warnings:

  - The values [CAN_CREATE_PROJECT,CAN_UPDATE_PROJECT,CAN_DELETE_PROJECT] on the enum `MODULE_FUNCTION` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MODULE_FUNCTION_new" AS ENUM ('CAN_CREATE_PROJECTS', 'CAN_UPDATE_PROJECTS', 'CAN_DELETE_PROJECTS');
ALTER TABLE "public"."Admin" ALTER COLUMN "moduleFunction" TYPE "public"."MODULE_FUNCTION_new"[] USING ("moduleFunction"::text::"public"."MODULE_FUNCTION_new"[]);
ALTER TABLE "public"."Secretary" ALTER COLUMN "moduleFunction" TYPE "public"."MODULE_FUNCTION_new"[] USING ("moduleFunction"::text::"public"."MODULE_FUNCTION_new"[]);
ALTER TYPE "public"."MODULE_FUNCTION" RENAME TO "MODULE_FUNCTION_old";
ALTER TYPE "public"."MODULE_FUNCTION_new" RENAME TO "MODULE_FUNCTION";
DROP TYPE "public"."MODULE_FUNCTION_old";
COMMIT;
