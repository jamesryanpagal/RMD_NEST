-- CreateTable
CREATE TABLE "public"."ReservationRequest" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "lotId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "transactionType" "public"."TRANSACTION_TYPE" NOT NULL,
    "modeOfPayment" "public"."MODE_OF_PAYMENT" NOT NULL,
    "paymentDate" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "referenceNumber" TEXT,
    "status" "public"."REQUEST_STATUS" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ReservationRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ReservationRequest" ADD CONSTRAINT "ReservationRequest_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
