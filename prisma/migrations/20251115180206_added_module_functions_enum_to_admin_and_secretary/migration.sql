-- CreateEnum
CREATE TYPE "public"."MODULE_FUNCTION" AS ENUM ('CAN_CREATE_PROJECT', 'CAN_UPDATE_PROJECT', 'CAN_DELETE_PROJECT');

-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "moduleFunction" "public"."MODULE_FUNCTION"[];

-- AlterTable
ALTER TABLE "public"."Secretary" ADD COLUMN     "moduleFunction" "public"."MODULE_FUNCTION"[];
