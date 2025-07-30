-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "nextPaymentDate" SET DATA TYPE TEXT,
ALTER COLUMN "paymentStartedDate" SET DATA TYPE TEXT,
ALTER COLUMN "paymentLastDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "targetDueDate" SET DATA TYPE TEXT;
