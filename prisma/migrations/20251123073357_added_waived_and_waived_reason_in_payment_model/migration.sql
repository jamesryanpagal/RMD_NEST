-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "waivedPenalty" BOOLEAN,
ADD COLUMN     "waivedReason" TEXT;
