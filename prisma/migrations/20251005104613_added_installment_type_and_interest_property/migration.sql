-- CreateEnum
CREATE TYPE "public"."INSTALLMENT_TYPE" AS ENUM ('STRAIGHT_MONTHLY_PAYMENT');

-- AlterTable
ALTER TABLE "public"."Contract" ADD COLUMN     "installmentType" "public"."INSTALLMENT_TYPE",
ADD COLUMN     "interest" INTEGER,
ADD COLUMN     "interestTotal" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."ContractAudit" ADD COLUMN     "installmentType" "public"."INSTALLMENT_TYPE",
ADD COLUMN     "interest" INTEGER,
ADD COLUMN     "interestTotal" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."ContractRequest" ADD COLUMN     "installmentType" "public"."INSTALLMENT_TYPE",
ADD COLUMN     "interest" INTEGER,
ADD COLUMN     "interestTotal" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."ContractRequestAudit" ADD COLUMN     "installmentType" "public"."INSTALLMENT_TYPE",
ADD COLUMN     "interest" INTEGER,
ADD COLUMN     "interestTotal" DOUBLE PRECISION;
