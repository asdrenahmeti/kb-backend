/*
  Warnings:

  - You are about to drop the column `siteId` on the `opening_hours` table. All the data in the column will be lost.
  - Added the required column `closingHours` to the `sites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingHours` to the `sites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "opening_hours" DROP CONSTRAINT "opening_hours_siteId_fkey";

-- DropIndex
DROP INDEX "opening_hours_siteId_key";

-- AlterTable
ALTER TABLE "opening_hours" DROP COLUMN "siteId";

-- AlterTable
ALTER TABLE "sites" ADD COLUMN     "closingHours" TEXT NOT NULL,
ADD COLUMN     "openingHours" TEXT NOT NULL;
