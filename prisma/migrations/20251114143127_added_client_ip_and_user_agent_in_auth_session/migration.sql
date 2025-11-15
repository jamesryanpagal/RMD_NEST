-- AlterTable
ALTER TABLE "public"."AuthSession" ADD COLUMN     "clientIp" TEXT,
ADD COLUMN     "userAgent" TEXT;
