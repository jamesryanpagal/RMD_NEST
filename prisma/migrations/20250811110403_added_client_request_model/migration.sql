-- CreateEnum
CREATE TYPE "public"."REQUEST_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."REQUEST_TYPE" AS ENUM ('ADD', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "public"."Client_Request" (
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
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Client_Request_pkey" PRIMARY KEY ("id")
);
