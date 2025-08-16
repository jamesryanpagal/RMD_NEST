-- DropForeignKey
ALTER TABLE "public"."ReservationRequest" DROP CONSTRAINT "ReservationRequest_targetId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ReservationRequest" ADD CONSTRAINT "ReservationRequest_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
