-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."Secretary" ADD COLUMN     "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE';
