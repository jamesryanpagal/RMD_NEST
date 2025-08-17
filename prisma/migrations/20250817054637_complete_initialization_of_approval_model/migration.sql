-- AlterEnum
ALTER TYPE "public"."REQUEST_MODULE" ADD VALUE 'FILE';

-- AlterTable
ALTER TABLE "public"."ClientRequest" ADD COLUMN     "dateRejected" TIMESTAMP(3),
ADD COLUMN     "rejectedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."ContractRequest" ADD COLUMN     "dateRejected" TIMESTAMP(3),
ADD COLUMN     "rejectedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."ReservationRequest" ADD COLUMN     "dateRejected" TIMESTAMP(3),
ADD COLUMN     "rejectedBy" TEXT;

-- CreateTable
CREATE TABLE "public"."PaymentRequest" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "transactionType" "public"."TRANSACTION_TYPE" NOT NULL,
    "modeOfPayment" "public"."MODE_OF_PAYMENT" NOT NULL,
    "targetDueDate" TEXT,
    "paymentDate" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "referenceNumber" TEXT,
    "penalized" BOOLEAN NOT NULL DEFAULT false,
    "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receiptNo" TEXT,
    "requestType" "public"."REQUEST_TYPE" NOT NULL,
    "status" "public"."REQUEST_STATUS" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "rejectedBy" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "dateRejected" TIMESTAMP(3),

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentCommissionRequest" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "terms" INTEGER,
    "recurringReleaseDate" INTEGER,
    "releaseStartDate" TEXT,
    "releaseEndDate" TEXT,
    "nextReleaseDate" TEXT,
    "monthlyReleaseAmount" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestType" "public"."REQUEST_TYPE" NOT NULL,
    "status" "public"."REQUEST_STATUS" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "rejectedBy" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "dateRejected" TIMESTAMP(3),

    CONSTRAINT "AgentCommissionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FileRequest" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "path" TEXT,
    "ext" TEXT,
    "name" TEXT,
    "description" TEXT,
    "requestType" "public"."REQUEST_TYPE" NOT NULL,
    "status" "public"."REQUEST_STATUS" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "rejectedBy" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "dateRejected" TIMESTAMP(3),

    CONSTRAINT "FileRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PaymentRequest" ADD CONSTRAINT "PaymentRequest_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FileRequest" ADD CONSTRAINT "FileRequest_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
