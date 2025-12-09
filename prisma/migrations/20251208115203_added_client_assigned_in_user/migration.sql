-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "clientAssigned" TEXT[] DEFAULT ARRAY[]::TEXT[];
