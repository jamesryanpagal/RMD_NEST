-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "status" "STATUS" NOT NULL DEFAULT 'ACTIVE',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
