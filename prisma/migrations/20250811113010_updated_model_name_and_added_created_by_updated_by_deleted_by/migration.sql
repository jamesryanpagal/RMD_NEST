/*
  Warnings:

  - You are about to drop the `Client_Request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Client_Request";

-- CreateTable
CREATE TABLE "public"."ClientRequest" (
    "id" TEXT NOT NULL,
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
    "status" "public"."REQUEST_STATUS" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "ClientRequest_pkey" PRIMARY KEY ("id")
);
