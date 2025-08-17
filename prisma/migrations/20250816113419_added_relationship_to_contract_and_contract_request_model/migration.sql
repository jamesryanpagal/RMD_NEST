-- AlterTable
ALTER TABLE "public"."ContractRequest" ADD COLUMN     "targetId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."ContractRequest" ADD CONSTRAINT "ContractRequest_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
