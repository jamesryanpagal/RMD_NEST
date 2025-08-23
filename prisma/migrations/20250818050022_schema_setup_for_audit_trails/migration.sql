-- CreateEnum
CREATE TYPE "public"."AUDIT_ACTION" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "public"."UserAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "mobile" TEXT NOT NULL,
    "houseNumber" TEXT,
    "street" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "subdivision" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "region" TEXT NOT NULL,
    "zip" TEXT,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "UserAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" INTEGER[],
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "AdminAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SecretaryAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "accessLevel" INTEGER[],
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "SecretaryAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "tinNumber" TEXT NOT NULL,
    "houseNumber" TEXT,
    "street" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "subdivision" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "region" TEXT NOT NULL,
    "zip" TEXT,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ClientAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientRequestAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "tinNumber" TEXT NOT NULL,
    "houseNumber" TEXT,
    "street" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "subdivision" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "region" TEXT NOT NULL,
    "zip" TEXT,
    "requestType" "public"."REQUEST_TYPE" NOT NULL,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ClientRequestAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "order" INTEGER NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "houseNumber" TEXT,
    "street" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "subdivision" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "region" TEXT NOT NULL,
    "zip" TEXT,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ProjectAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContractAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "sqmPrice" DOUBLE PRECISION NOT NULL,
    "downPaymentType" "public"."DOWN_PAYMENT_TYPE",
    "downPaymentStatus" "public"."DOWN_PAYMENT_STATUS",
    "totalMonthlyDown" DOUBLE PRECISION,
    "totalMonthly" DOUBLE PRECISION,
    "downPayment" INTEGER,
    "totalDownPayment" DOUBLE PRECISION,
    "totalDownPaymentBalance" DOUBLE PRECISION,
    "downPaymentTerms" INTEGER,
    "terms" INTEGER,
    "miscellaneous" "public"."MISCELLANEOUS" NOT NULL,
    "miscellaneousTotal" DOUBLE PRECISION NOT NULL,
    "agentCommission" "public"."COMMISSION" NOT NULL,
    "agentCommissionTotal" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "totalLotPrice" DOUBLE PRECISION NOT NULL,
    "tcp" DOUBLE PRECISION NOT NULL,
    "paymentType" "public"."PAYMENT_TYPE" NOT NULL,
    "totalCashPayment" DOUBLE PRECISION,
    "recurringPaymentDay" INTEGER,
    "nextPaymentDate" TEXT,
    "paymentStartedDate" TEXT,
    "paymentLastDate" TEXT,
    "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "penaltyCount" INTEGER NOT NULL DEFAULT 0,
    "excessPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ContractAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContractRequestAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "sqmPrice" DOUBLE PRECISION NOT NULL,
    "downPaymentType" "public"."DOWN_PAYMENT_TYPE",
    "downPaymentStatus" "public"."DOWN_PAYMENT_STATUS",
    "totalMonthlyDown" DOUBLE PRECISION,
    "totalMonthly" DOUBLE PRECISION,
    "downPayment" INTEGER,
    "totalDownPayment" DOUBLE PRECISION,
    "totalDownPaymentBalance" DOUBLE PRECISION,
    "downPaymentTerms" INTEGER,
    "terms" INTEGER,
    "miscellaneous" "public"."MISCELLANEOUS" NOT NULL,
    "miscellaneousTotal" DOUBLE PRECISION NOT NULL,
    "agentCommission" "public"."COMMISSION" NOT NULL,
    "agentCommissionTotal" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "totalLotPrice" DOUBLE PRECISION NOT NULL,
    "tcp" DOUBLE PRECISION NOT NULL,
    "paymentType" "public"."PAYMENT_TYPE" NOT NULL,
    "totalCashPayment" DOUBLE PRECISION,
    "recurringPaymentDay" INTEGER,
    "nextPaymentDate" TEXT,
    "paymentStartedDate" TEXT,
    "paymentLastDate" TEXT,
    "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "penaltyCount" INTEGER NOT NULL DEFAULT 0,
    "excessPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestType" "public"."REQUEST_TYPE" NOT NULL,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ContractRequestAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PhaseAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "PhaseAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlockAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "BlockAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LotAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "title" TEXT NOT NULL,
    "sqm" DOUBLE PRECISION,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "LotAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "transactionType" "public"."TRANSACTION_TYPE" NOT NULL,
    "modeOfPayment" "public"."MODE_OF_PAYMENT" NOT NULL,
    "targetDueDate" TEXT,
    "paymentDate" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "referenceNumber" TEXT,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "PaymentAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentRequestAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
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
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "PaymentRequestAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReservationAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "validity" TIMESTAMP(3) NOT NULL,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ReservationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReservationRequestAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "modeOfPayment" "public"."MODE_OF_PAYMENT" NOT NULL,
    "paymentDate" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "referenceNumber" TEXT,
    "requestType" "public"."REQUEST_TYPE" NOT NULL,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ReservationRequestAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "birthDate" TEXT,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "AgentAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentCommissionAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "terms" INTEGER,
    "recurringReleaseDate" INTEGER,
    "releaseStartDate" TEXT,
    "releaseEndDate" TEXT,
    "nextReleaseDate" TEXT,
    "monthlyReleaseAmount" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "AgentCommissionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentCommissionRequestAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "terms" INTEGER,
    "recurringReleaseDate" INTEGER,
    "releaseStartDate" TEXT,
    "releaseEndDate" TEXT,
    "nextReleaseDate" TEXT,
    "monthlyReleaseAmount" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestType" "public"."REQUEST_TYPE" NOT NULL,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "AgentCommissionRequestAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FileAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "path" TEXT,
    "ext" TEXT,
    "name" TEXT,
    "description" TEXT,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "FileAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FileRequestAudit" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "action" "public"."AUDIT_ACTION" NOT NULL,
    "path" TEXT,
    "ext" TEXT,
    "name" TEXT,
    "description" TEXT,
    "requestType" "public"."REQUEST_TYPE" NOT NULL,
    "status" "public"."STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "FileRequestAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."UserAudit" ADD CONSTRAINT "UserAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminAudit" ADD CONSTRAINT "AdminAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SecretaryAudit" ADD CONSTRAINT "SecretaryAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Secretary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientAudit" ADD CONSTRAINT "ClientAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientRequestAudit" ADD CONSTRAINT "ClientRequestAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."ClientRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectAudit" ADD CONSTRAINT "ProjectAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContractAudit" ADD CONSTRAINT "ContractAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContractRequestAudit" ADD CONSTRAINT "ContractRequestAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."ContractRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PhaseAudit" ADD CONSTRAINT "PhaseAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlockAudit" ADD CONSTRAINT "BlockAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LotAudit" ADD CONSTRAINT "LotAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAudit" ADD CONSTRAINT "PaymentAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentRequestAudit" ADD CONSTRAINT "PaymentRequestAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."PaymentRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReservationAudit" ADD CONSTRAINT "ReservationAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReservationRequestAudit" ADD CONSTRAINT "ReservationRequestAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."ReservationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentAudit" ADD CONSTRAINT "AgentAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentCommissionAudit" ADD CONSTRAINT "AgentCommissionAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."AgentCommission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentCommissionRequestAudit" ADD CONSTRAINT "AgentCommissionRequestAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."AgentCommissionRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FileAudit" ADD CONSTRAINT "FileAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FileRequestAudit" ADD CONSTRAINT "FileRequestAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."FileRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
