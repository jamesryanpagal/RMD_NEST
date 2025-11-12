/*
  Warnings:

  - Changed the type of `theme` on the `Settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Settings" DROP COLUMN "theme",
ADD COLUMN     "theme" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."THEME";
