/*
  Warnings:

  - Added the required column `date` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `opening_hours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "opening_hours" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pricing" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "pricing" DROP NOT NULL;
