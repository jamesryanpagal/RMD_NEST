-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Agent" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."AgentCommission" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Block" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Contract" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Lot" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Phase" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Reservation" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Secretary" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;
