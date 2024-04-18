-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "available" SET DEFAULT true;

-- AlterTable
ALTER TABLE "sites" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
