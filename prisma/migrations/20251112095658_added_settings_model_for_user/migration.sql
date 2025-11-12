-- CreateEnum
CREATE TYPE "public"."THEME" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "public"."Settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" "public"."THEME" NOT NULL DEFAULT 'SYSTEM',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "public"."Settings"("userId");

-- AddForeignKey
ALTER TABLE "public"."Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
