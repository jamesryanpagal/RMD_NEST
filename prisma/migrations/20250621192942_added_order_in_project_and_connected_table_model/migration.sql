-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "order" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Lot" ADD COLUMN     "order" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Phase" ADD COLUMN     "order" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "order" SERIAL NOT NULL;
