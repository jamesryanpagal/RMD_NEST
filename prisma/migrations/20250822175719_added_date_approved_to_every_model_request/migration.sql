-- AlterTable
ALTER TABLE "public"."AgentCommissionRequest" ADD COLUMN     "dateApproved" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."ClientRequest" ADD COLUMN     "dateApproved" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."ContractRequest" ADD COLUMN     "dateApproved" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."FileRequest" ADD COLUMN     "dateApproved" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."PaymentRequest" ADD COLUMN     "dateApproved" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."ReservationRequest" ADD COLUMN     "dateApproved" TIMESTAMP(3);
