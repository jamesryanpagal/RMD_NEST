-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "projectAssigned" TEXT[] DEFAULT ARRAY[]::TEXT[];
